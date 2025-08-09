import DialectTranslator from '@/components/dialect-translator';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold text-primary">
          Bhasha Boli
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Your personal AI Malayalam dialect converter. Translate any Manglish
          sentence into the unique slangs of all 14 Kerala districts.
        </p>
      </header>
      <DialectTranslator />
    </main>
  );
}
