import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({
  items,
  id,
  className = "",
}: {
  items: BreadcrumbItem[];
  id?: string;
  className?: string;
}) {
  return (
    <nav
      id={id}
      aria-label="Breadcrumb"
      className={`my-6 text-sm text-muted ${className}`.trim()}
    >
      <ol className="flex flex-wrap items-center">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex min-w-0 items-center">
            {index > 0 && <span aria-hidden="true" className="mx-2">
              <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
            </span>}
            {item.href && index < items.length - 1 ? (
              <Link href={item.href} className="truncate hover:text-accent">
                {item.label}
              </Link>
            ) : (
              <span aria-current={index === items.length - 1 ? "page" : undefined} className="font-semibold truncate text-foreground">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
