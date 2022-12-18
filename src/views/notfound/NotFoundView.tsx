import { ReactNode } from "react";
import { IconPatch } from "@/components/buttons/IconPatch";
import { Icons } from "@/components/Icon";
import { Navigation } from "@/components/layout/Navigation";
import { ArrowLink } from "@/components/text/ArrowLink";
import { Title } from "@/components/text/Title";
import { useTranslation } from "react-i18next";

function NotFoundWrapper(props: { children?: ReactNode }) {
  return (
    <div className="h-screen flex-1">
      <Navigation />
      <div className="flex h-full flex-col items-center justify-center p-5 text-center">
        {props.children}
      </div>
    </div>
  );
}

export function NotFoundMedia() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-5 text-center">
      <IconPatch
        icon={Icons.EYE_SLASH}
        className="mb-6 text-xl text-bink-600"
      />
      <Title>{t('notFound.media.title')}</Title>
      <p className="mt-5 mb-12 max-w-sm">
        {t('notFound.media.description')}
      </p>
      <ArrowLink to="/" linkText={t('notFound.backArrow')} />
    </div>
  );
}

export function NotFoundProvider() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-5 text-center">
      <IconPatch
        icon={Icons.EYE_SLASH}
        className="mb-6 text-xl text-bink-600"
      />
      <Title>{t('notFound.provider.title')}</Title>
      <p className="mt-5 mb-12 max-w-sm">
        {t('notFound.provider.description')}
      </p>
      <ArrowLink to="/" linkText={t('notFound.backArrow')} />
    </div>
  );
}

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <NotFoundWrapper>
      <IconPatch
        icon={Icons.EYE_SLASH}
        className="mb-6 text-xl text-bink-600"
      />
      <Title>{t('notFound.page.title')}</Title>
      <p className="mt-5 mb-12 max-w-sm">
        {t('notFound.page.description')}
      </p>
      <ArrowLink to="/" linkText={t('notFound.backArrow')} />
    </NotFoundWrapper>
  );
}
