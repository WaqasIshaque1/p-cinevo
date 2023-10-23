import { useMemo } from "react";

import { Button } from "@/components/Button";
import { Icon, Icons } from "@/components/Icon";
import { IconPill } from "@/components/layout/IconPill";
import { Paragraph } from "@/components/text/Paragraph";
import { Title } from "@/components/text/Title";
import { ScrapingItems, ScrapingSegment } from "@/hooks/useProviderScrape";
import { ErrorContainer, ErrorLayout } from "@/pages/layouts/ErrorLayout";

export interface ScrapeErrorPartProps {
  data: {
    sources: Record<string, ScrapingSegment>;
    sourceOrder: ScrapingItems[];
  };
}

export function ScrapeErrorPart(props: ScrapeErrorPartProps) {
  const error = useMemo(() => {
    const data = props.data;
    const amountError = Object.values(data.sources).filter(
      (v) => v.status === "failure"
    );
    if (amountError.length === 0) return null;
    let str = "";
    Object.values(data.sources).forEach((v) => {
      str += `${v.id}: ${v.status}\n`;
      if (v.reason) str += `${v.reason}\n`;
      if (v.error) str += `${v.error.toString()}\n`;
    });
    return str;
  }, [props]);

  return (
    <ErrorLayout>
      <ErrorContainer>
        <IconPill icon={Icons.WAND}>Not found</IconPill>
        <Title>Goo goo gaa gaa</Title>
        <Paragraph>
          Oh, my apowogies, sweetie! The itty-bitty movie-web did its utmost
          bestest, but alas, no wucky videos to be spotted anywhere (´⊙ω⊙`)
          Please don&apos;t be angwy, wittle movie-web ish twying so hard. Can
          you find it in your heart to forgive? UwU 💖
        </Paragraph>
        <Button
          href="/"
          theme="purple"
          padding="md:px-12 p-2.5"
          className="mt-6"
        >
          Go home
        </Button>
      </ErrorContainer>
      <ErrorContainer maxWidth="max-w-[45rem]">
        {/* Error */}
        {error ? (
          <div className="w-full bg-errors-card p-6 rounded-lg">
            <div className="flex justify-between items-center pb-2 border-b border-errors-border">
              <span className="text-white font-medium">Error details</span>
              <div className="flex justify-center items-center gap-3">
                <Button theme="secondary" padding="p-2 md:px-4">
                  <Icon icon={Icons.COPY} className="text-2xl mr-3" />
                  Copy
                </Button>
                <Button theme="secondary" padding="p-2 md:px-2">
                  <Icon icon={Icons.X} className="text-2xl" />
                </Button>
              </div>
            </div>
            <div className="mt-4 h-60 overflow-y-auto text-left whitespace-pre pointer-events-auto">
              {error}
            </div>
          </div>
        ) : null}
      </ErrorContainer>
    </ErrorLayout>
  );
}
