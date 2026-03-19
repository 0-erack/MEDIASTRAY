import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MarkdownDisplay.css';

function MarkdownDisplay({ text }:{text:string}) {
  return (
    <div className='markdown overflow-y-scroll w-auto border border-principal p-2' style={{ maxHeight: '400px' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
    
  )
}

export default MarkdownDisplay;