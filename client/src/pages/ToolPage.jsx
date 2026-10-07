import { useParams } from 'react-router-dom';
import NotFoundPage from './NotFoundPage.jsx';
import ToolLayout from '../components/tools/ToolLayout.jsx';
import WordCounterTool from '../components/tools/WordCounterTool.jsx';
import CharacterCounterTool from '../components/tools/CharacterCounterTool.jsx';
import CaseConverterTool from '../components/tools/CaseConverterTool.jsx';
import JsonFormatterTool from '../components/tools/JsonFormatterTool.jsx';
import UrlCodecTool from '../components/tools/UrlCodecTool.jsx';
import Base64CodecTool from '../components/tools/Base64CodecTool.jsx';
import PasswordGeneratorTool from '../components/tools/PasswordGeneratorTool.jsx';
import UuidGeneratorTool from '../components/tools/UuidGeneratorTool.jsx';
import SlugGeneratorTool from '../components/tools/SlugGeneratorTool.jsx';
import TimestampConverterTool from '../components/tools/TimestampConverterTool.jsx';
import ColorConverterTool from '../components/tools/ColorConverterTool.jsx';
import GradientGeneratorTool from '../components/tools/GradientGeneratorTool.jsx';
import HtmlEntityEncoderTool from '../components/tools/HtmlEntityEncoderTool.jsx';
import RegexTesterTool from '../components/tools/RegexTesterTool.jsx';
import NumberBaseConverterTool from '../components/tools/NumberBaseConverterTool.jsx';
import LoremIpsumGeneratorTool from '../components/tools/LoremIpsumGeneratorTool.jsx';
import TextDiffCheckerTool from '../components/tools/TextDiffCheckerTool.jsx';
import CsvToJsonTool from '../components/tools/CsvToJsonTool.jsx';
import MarkdownTableGeneratorTool from '../components/tools/MarkdownTableGeneratorTool.jsx';
import PercentageCalculatorTool from '../components/tools/PercentageCalculatorTool.jsx';
import { toolBySlug } from '../data/tools.js';

const toolInterfaces = {
  'word-counter': WordCounterTool,
  'character-counter': CharacterCounterTool,
  'case-converter': CaseConverterTool,
  'json-formatter': JsonFormatterTool,
  'url-encoder-decoder': UrlCodecTool,
  'base64-encoder-decoder': Base64CodecTool,
  'password-generator': PasswordGeneratorTool,
  'uuid-generator': UuidGeneratorTool,
  'slug-generator': SlugGeneratorTool,
  'timestamp-converter': TimestampConverterTool,
  'color-converter': ColorConverterTool,
  'gradient-generator': GradientGeneratorTool,
  'html-entity-encoder': HtmlEntityEncoderTool,
  'regex-tester': RegexTesterTool,
  'number-base-converter': NumberBaseConverterTool,
  'lorem-ipsum-generator': LoremIpsumGeneratorTool,
  'text-diff-checker': TextDiffCheckerTool,
  'csv-to-json': CsvToJsonTool,
  'markdown-table-generator': MarkdownTableGeneratorTool,
  'percentage-calculator': PercentageCalculatorTool,
};

export default function ToolPage() {
  const { slug } = useParams();
  const tool = toolBySlug[slug];
  if (!tool) return <NotFoundPage />;
  const ToolInterface = toolInterfaces[slug];

  return <ToolLayout tool={tool}><ToolInterface /></ToolLayout>;
}
