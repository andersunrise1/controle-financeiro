export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-8">
      <div className="rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">
          DIVISA — API
        </h1>
        <p className="mt-2 text-gray-600">
          Backend rodando na porta 3001. Use o frontend em{" "}
          <code className="rounded bg-gray-100 px-2 py-1">localhost:3000</code>.
        </p>
      </div>
    </main>
  );
}
