import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MarkdownDisplay.css';

/**
 * Componente para mostrar Markdown
 * @param text texto en formato Markdown
 */
const MarkdownDisplay = memo(function MarkdownDisplay({ text }:{text:string}) {
  return (
    <div className='markdown overflow-y-scroll w-auto border border-principal p-2 bg-fondo-especial-1' style={{ maxHeight: '400px' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
    
  )
})

export default MarkdownDisplay;