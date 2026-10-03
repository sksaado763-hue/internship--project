import { useParams } from 'react-router-dom';
import NotFoundPage from './NotFoundPage.jsx';
import ToolLayout from '../components/tools/ToolLayout.jsx';
import WordCounterTool from '../components/tools/WordCounterTool.jsx';
import CharacterCounterTool from '../components/tools/CharacterCounterTool.jsx';
import CaseConverterTool from '../components/tools/CaseConverterTool.jsx';
import JsonFormatterTool from '../components/tools/JsonFormatterTool.jsx';
import UrlCodecTool from '../components/tools/UrlCodecTool.jsx';
import Base64CodecTool from '../components/tools/Base64CodecTool.jsx';
import { toolBySlug } from '../data/tools.js';

const toolInterfaces = {
  'word-counter': WordCounterTool,
  'character-counter': CharacterCounterTool,
  'case-converter': CaseConverterTool,
  'json-formatter': JsonFormatterTool,
  'url-encoder-decoder': UrlCodecTool,
  'base64-encoder-decoder': Base64CodecTool,
};

export default function ToolPage() {
  const { slug } = useParams();
  const tool = toolBySlug[slug];
  if (!tool) return <NotFoundPage />;
  const ToolInterface = toolInterfaces[slug];

  return <ToolLayout tool={tool}><ToolInterface /></ToolLayout>;
}
