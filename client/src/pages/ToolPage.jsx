import { useParams } from 'react-router-dom';
import NotFoundPage from './NotFoundPage.jsx';
import ToolLayout from '../components/tools/ToolLayout.jsx';
import WordCounterTool from '../components/tools/WordCounterTool.jsx';
import CharacterCounterTool from '../components/tools/CharacterCounterTool.jsx';
import CaseConverterTool from '../components/tools/CaseConverterTool.jsx';
import { toolBySlug } from '../data/tools.js';

const toolInterfaces = {
  'word-counter': WordCounterTool,
  'character-counter': CharacterCounterTool,
  'case-converter': CaseConverterTool,
};

export default function ToolPage() {
  const { slug } = useParams();
  const tool = toolBySlug[slug];
  if (!tool) return <NotFoundPage />;
  const ToolInterface = toolInterfaces[slug];

  return <ToolLayout tool={tool}><ToolInterface /></ToolLayout>;
}
