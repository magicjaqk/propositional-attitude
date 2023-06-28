import Head from "next/head";
import { useChat } from "ai/react";
import { useUser } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";

export const config = {
  runtime: "nodejs",
};

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();

  const { messages, input, handleInputChange, handleSubmit, error } = useChat({
    api: "/api/chat",
    onError: (err) => {
      console.error(err);
    },
  });

  // In case the user signs out while on the page.
  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Propositional Attitudes &mdash; JAQK.COFFEE</title>
        <meta
          name="description"
          content="Challenging beliefs one prompt at a time."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="fixed inset-x-0 top-0 z-10 flex items-center justify-between bg-white p-4">
        <h1 className="text-2xl font-bold">Propositional Attitudes</h1>
        <p className="text-gray-500">{user.emailAddresses[0]?.emailAddress}</p>
      </header>
      <main className="min-h-screen w-full">
        {/* Form for interacting with OpenAI chat -- sourced from https://sdk.vercel.ai/ example page */}
        <div className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-between px-2 pt-6">
          <ul className="mb-20 flex w-full flex-col space-y-2 py-20">
            {messages.map((m, index) => (
              <li
                key={index}
                className={
                  m.role === "user"
                    ? "w-full rounded bg-blue-200 p-2"
                    : "w-full rounded bg-yellow-200 p-2"
                }
              >
                <p className="text-sm font-medium text-gray-500">
                  {m.role === "user" ? "User: " : "AI: "}
                </p>
                <ReactMarkdown className="[&_ol]:m-4 [&_ol]:ml-8 [&_ol]:list-decimal">
                  {m.content}
                </ReactMarkdown>
              </li>
            ))}
          </ul>

          <div className="fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-xl flex-grow-0 flex-col items-center justify-center">
            {error && (
              <div className="m-1 w-full rounded bg-red-500 p-2 px-4 text-white shadow">
                {error.message}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col rounded-t-md border-x border-t bg-slate-100 px-4 pt-4 shadow"
            >
              <input
                value={input}
                onChange={handleInputChange}
                className="w-full rounded border p-2"
                placeholder="Ask something..."
              />
              <button
                type="submit"
                className="my-4 mt-2 rounded bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
