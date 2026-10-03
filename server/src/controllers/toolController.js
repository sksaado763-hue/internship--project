import { listTools } from '../services/toolService.js';

export async function getTools(request, response, next) {
  try {
    const tools = await listTools(request.query);
    response.json({ success: true, data: { tools } });
  } catch (error) {
    next(error);
  }
}
