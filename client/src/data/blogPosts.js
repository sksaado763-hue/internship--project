export const blogTopics = ['All Topics', 'AI & Tools', 'Productivity', 'Writing', 'Privacy', 'Developer', 'Images & PDFs'];

export const blogPosts = [
  {
    slug: 'a-small-toolkit-for-everyday-work',
    title: 'A small toolkit for everyday online work',
    category: 'Productivity',
    readTime: '4 min read',
    featured: true,
    excerpt: 'A practical way to handle the little text, image, document, and calculation tasks that interrupt your day.',
    body: [
      'Most online work is made up of small tasks: clean up a paragraph, resize an image, check a calculation, or prepare a document. Each task is simple on its own, but switching between sites and apps can take longer than the work itself.',
      'A compact toolkit helps by putting common utilities in one place. Start with the task you need, check the result, and move on. You do not need a complicated workflow for a one-minute job.',
      'When choosing a tool, look for a clear input, a result you can inspect, and a visible explanation of where processing happens. That keeps quick tasks quick and helps you make an informed choice about your files and text.'
    ],
  },
  {
    slug: 'what-to-check-before-using-ai-tools',
    title: 'What to check before using an AI tool',
    category: 'AI & Tools',
    readTime: '5 min read',
    excerpt: 'Understand what the tool can do, what it sends to a provider, and how to review the result.',
    body: [
      'Before using an AI feature, check whether it is a working provider connection or a local demonstration. A demo can show the interface and workflow without producing a real model result.',
      'If a provider is connected, read the tool’s privacy note and consider whether the text or image is appropriate to submit. API usage may also have a cost, depending on the provider and account.',
      'Treat generated output as a draft. Review facts, tone, names, and any important details before using it in a message, publication, or decision.'
    ],
  },
  {
    slug: 'make-writing-workflows-feel-lighter',
    title: 'Make everyday writing feel lighter',
    category: 'Writing',
    readTime: '3 min read',
    excerpt: 'A few small editing passes can make emails, notes, and web copy easier to read.',
    body: [
      'A useful writing pass starts with the reader. Decide what they need to know, put that first, and remove details that do not help them understand or act.',
      'Then read the text aloud. Break up sentences that are hard to follow, replace vague phrases with concrete ones, and keep a consistent tone.',
      'Writing utilities can help with specific steps such as counting words, changing case, or drafting a starting point. Use them to support your judgment, not to replace it.'
    ],
  },
  {
    slug: 'keep-simple-tasks-private',
    title: 'How to think about privacy in browser tools',
    category: 'Privacy',
    readTime: '4 min read',
    excerpt: 'Know the difference between local processing and a feature that sends data to an external service.',
    body: [
      'A browser-based interface does not automatically mean every operation stays on your device. Some tools process files locally; others send input to a server or provider to complete the task.',
      'Look for a plain-language privacy note before submitting sensitive text or files. If the destination is unclear, avoid entering confidential information until you understand how the feature works.',
      'For local tools, you can often confirm the behavior by disconnecting from the network after the page has loaded. For connected tools, check the service’s own privacy and retention information.'
    ],
  },
  {
    slug: 'developer-utilities-for-small-jobs',
    title: 'Small developer utilities that save context switching',
    category: 'Developer',
    readTime: '4 min read',
    excerpt: 'Keep common formatting and conversion jobs close at hand while you build.',
    body: [
      'When coding, small interruptions can break concentration. Formatting a snippet, checking a color, or converting a value should take a few seconds and return you to the task at hand.',
      'A good utility makes its input and output visible, handles ordinary edge cases, and lets you copy the result without hiding what it changed.',
      'For production code, always verify generated or converted output in your project. A quick helper is useful, but your test suite and application context remain the source of truth.'
    ],
  },
  {
    slug: 'prepare-images-and-pdfs',
    title: 'A cleaner way to prepare images and PDFs',
    category: 'Images & PDFs',
    readTime: '3 min read',
    excerpt: 'Check formats, dimensions, and file handling before sharing or publishing a document.',
    body: [
      'Before sharing an image, check its dimensions, orientation, and file type. For a PDF, make sure the pages are in the right order and that the document opens as expected on another device.',
      'Use tools that explain whether processing is local or uses an external service, especially when a document contains personal or business information.',
      'Keep an untouched copy of important source files. That makes it easy to recover if a conversion or edit does not produce the result you expected.'
    ],
  },
];
