"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { ClipboardList, Search, Users, Wrench } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useAdminSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function GlobalSearch() {
  const router = useRouter();
  const { sessionToken } = useAdminSession();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useQuery(
    api.search.globalSearch,
    sessionToken && query.trim().length >= 2
      ? { sessionToken, query: query.trim() }
      : "skip"
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function navigate(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const hasResults =
    results &&
    (results.tools.length > 0 ||
      results.technicians.length > 0 ||
      results.categories.length > 0);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden h-8 w-52 justify-start gap-2 px-2.5 text-muted-foreground md:inline-flex"
        onClick={() => setOpen(true)}
        data-tour="global-search"
      >
        <Search className="size-4 shrink-0" />
        <span className="truncate">Search…</span>
        <kbd className="ml-auto hidden rounded border bg-muted px-1.5 text-[10px] font-medium lg:inline">
          Ctrl K
        </kbd>
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Search"
      >
        <Search className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="border-b px-4 py-3">
            <DialogTitle className="sr-only">Search</DialogTitle>
            <DialogDescription className="sr-only">
              Search tools, technicians, and categories
            </DialogDescription>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools, technicians, categories…"
                className="h-10 border-0 pr-3 pl-9 shadow-none focus-visible:ring-0"
              />
            </div>
          </DialogHeader>

          <div className="max-h-80 overflow-y-auto p-2">
            {query.trim().length < 2 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search
              </p>
            ) : results === undefined ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                Searching…
              </p>
            ) : !hasResults ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                No results for &ldquo;{query.trim()}&rdquo;
              </p>
            ) : (
              <div className="space-y-3">
                {results.tools.length > 0 ? (
                  <SearchGroup title="Tools" icon={Wrench}>
                    {results.tools.map((tool) => (
                      <SearchItem
                        key={tool._id}
                        title={tool.name}
                        subtitle={`${tool.assetTag} · ${tool.status.replace("_", " ")}`}
                        onSelect={() => navigate(tool.href)}
                      />
                    ))}
                  </SearchGroup>
                ) : null}

                {results.technicians.length > 0 ? (
                  <SearchGroup title="Technicians" icon={Users}>
                    {results.technicians.map((tech) => (
                      <SearchItem
                        key={tech._id}
                        title={tech.name}
                        subtitle={`${tech.employeeCode}${tech.isActive ? "" : " · inactive"}`}
                        onSelect={() => navigate(tech.href)}
                      />
                    ))}
                  </SearchGroup>
                ) : null}

                {results.categories.length > 0 ? (
                  <SearchGroup title="Categories" icon={ClipboardList}>
                    {results.categories.map((cat) => (
                      <SearchItem
                        key={cat._id}
                        title={cat.name}
                        subtitle="Tool category"
                        onSelect={() => navigate(cat.href)}
                      />
                    ))}
                  </SearchGroup>
                ) : null}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SearchGroup({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SearchItem({
  title,
  subtitle,
  onSelect,
}: {
  title: string;
  subtitle: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col rounded-md px-2 py-2 text-left text-sm transition-colors",
        "hover:bg-muted/80"
      )}
    >
      <span className="font-medium">{title}</span>
      <span className="text-xs text-muted-foreground">{subtitle}</span>
    </button>
  );
}
