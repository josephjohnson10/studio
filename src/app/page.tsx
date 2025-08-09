import DialectTranslator from '@/components/dialect-translator';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <h1 className="font-headline text-2xl md:text-3xl font-bold text-primary flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-accent"
          >
            <path d="M3 5h12" />
            <path d="M3 12h18" />
            <path d="M3 19h12" />
            <path d="m21 12-4-4" />
            <path d="m21 12 4 4" />
          </svg>
          Bhasha Boli
        </h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <p className="text-muted-foreground">
            Your personal AI Malayalam dialect converter. Translate any Manglish
            sentence into the unique slangs of all 14 Kerala districts.
          </p>
        </div>
        <DialectTranslator />
      </main>
    </div>
  );
}
