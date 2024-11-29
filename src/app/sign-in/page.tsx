import { AuthButtons } from '@/components/AuthButtons';

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900">
      <div className="bg-stone-800 p-8 rounded-lg shadow-xl">
        <div className="flex items-center justify-center mb-8">
          <img src="/routopia-logo.svg" alt="Routopia" className="h-8 w-8 mr-2" />
          <span className="text-2xl font-bold text-white">Routopia</span>
        </div>
        
        <AuthButtons />
      </div>
    </div>
  );
}