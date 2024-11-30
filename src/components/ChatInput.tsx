interface ChatInputProps {
  onResponse: (response: string) => void;
}

export default function ChatInput({ onResponse }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Call your GPT API here
    const response = await getGPTResponse(input);
    onResponse(response);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a question..."
        className="chat-input"
      />
    </form>
  );
} 