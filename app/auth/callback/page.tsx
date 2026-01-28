export default function AuthCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-green-200">
        <div className="flex flex-col items-center gap-2 mb-4">
          <span className="text-5xl">✅</span>
          <h1 className="text-3xl font-extrabold text-green-700">Confirmação realizada!</h1>
        </div>
        <p className="text-lg text-gray-700 mb-8">
          Seu e-mail foi confirmado com sucesso.<br />
          Agora você já pode acessar sua conta normalmente.<br />
        </p>
        <a
          href="/login"
          className="inline-block bg-blue-600 text-white text-lg font-bold px-8 py-3 rounded-xl shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Ir para o Login
        </a>
      </div>
    </div>
  );
}
