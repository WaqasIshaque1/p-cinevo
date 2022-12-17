import { Icon, Icons } from "@/components/Icon";
import { useTranslation } from "react-i18next";

export function BrandPill(props: { clickable?: boolean }) {
  const { t } = useTranslation();

  return (
    <div
      className={`flex items-center space-x-2 rounded-full bg-bink-100 bg-opacity-50 px-4 py-2 text-bink-600 ${props.clickable
          ? "transition-[transform,background-color] hover:scale-105 hover:bg-bink-200 hover:text-bink-700 active:scale-95"
          : ""
        }`}
    >
      <Icon className="text-xl" icon={Icons.MOVIE_WEB} />
      <span className="font-semibold text-white">{t('global.name')}</span>
    </div>
  );
}
