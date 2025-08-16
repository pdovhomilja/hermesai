import { getTranslations } from "next-intl/server";
import { Link } from "../../i18n/navigation";
import { auth } from "@/auth";

export default async function HomePage() {
  const t = await getTranslations("HomePage");
  const session = await auth();
  const userCid = session?.user?.cid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-blue-950 to-indigo-950 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-gold-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
              {t("title")}
            </h1>
            <h2 className="text-2xl font-light mb-8 text-amber-200">
              {t("subtitle")}
            </h2>
          </div>

          <div className="mb-12">
            <p className="text-lg leading-relaxed text-gray-300 max-w-2xl mx-auto">
              {t("description")}
            </p>
          </div>

          <div className="flex gap-6 justify-center items-center flex-col sm:flex-row">
            {session && userCid ? (
              <Link
                href={{
                  pathname: `/${userCid}/`
                }}
                className="px-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-semibold rounded-lg transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-amber-500/25"
              >
                {t("startChat")}
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="px-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-semibold rounded-lg transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-amber-500/25"
              >
                {t("startChat")}
              </Link>
            )}
            <Link
              href="/about"
              className="px-8 py-4 border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black font-semibold rounded-lg transition-all duration-200"
            >
              {t("learnMore")}
            </Link>
          </div>
        </div>

        <div className="mt-20 text-center">
          <div className="inline-block p-8 bg-black/20 backdrop-blur-sm border border-amber-400/30 rounded-lg">
            <div className="text-amber-300 text-4xl mb-4">☿</div>
            <p className="text-amber-200 italic">
              &ldquo;As above, so below; as within, so without&rdquo;
            </p>
            <p className="text-gray-400 mt-2 text-sm">— The Emerald Tablet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
