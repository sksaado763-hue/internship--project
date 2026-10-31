import { getToolBySlug, listTools, setToolVisibility } from '../services/toolService.js';

export async function getTools(request, response, next) {
  try {
    const tools = await listTools(request.query);
    response.json({ success: true, data: { tools } });
  } catch (error) {
    next(error);
  }
}

export async function getTool(request, response, next) {
  try {
    const tool = await getToolBySlug(request.params.slug);
    if (!tool) return response.status(404).json({ success: false, message: 'Tool not found.' });
    response.json({ success: true, data: { tool } });
  } catch (error) {
    next(error);
  }
}

export async function patchToolVisibility(request, response, next) {
  try {
    const { slug } = request.params;
    const { hidden } = request.body;

    if (typeof hidden !== 'boolean') {
      return response.status(400).json({ success: false, message: '`hidden` must be a boolean.' });
    }

    const tool = await setToolVisibility(slug, hidden);
    if (!tool) return response.status(404).json({ success: false, message: 'Tool not found.' });

    response.json({
      success: true,
      message: `Tool "${tool.name}" is now ${hidden ? 'hidden' : 'visible'}.`,
      data: { tool },
    });
  } catch (error) {
    next(error);
  }
}
