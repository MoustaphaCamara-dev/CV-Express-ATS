import LoginForm from '../components/LoginForm';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">CVATS</h1>
          <p className="mt-2 text-gray-600">
            Créez votre CV optimisé pour les ATS
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
