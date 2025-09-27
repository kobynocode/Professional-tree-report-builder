import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `You are an experienced consulting arborist. Craft formal, concise tree inspection reports.
Return clean HTML with headings, lists, and paragraphs. Include a summary, detailed findings per tree, and recommendations.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { clientInfo, trees } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Missing OpenAI API key' });
  }

  if (!Array.isArray(trees) || trees.length === 0) {
    return res.status(400).json({ error: 'At least one tree is required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Client info: ${JSON.stringify(clientInfo, null, 2)}\nTrees: ${JSON.stringify(
            trees,
            null,
            2
          )}\nPlease produce a comprehensive Visual Tree Inspection Report.`,
        },
      ],
    });

    const report = completion.choices?.[0]?.message?.content?.trim();

    return res.status(200).json({ report });
  } catch (error) {
    console.error('Report generation error', error);
    return res.status(500).json({ error: 'Failed to generate report' });
  }
}
