"use client";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { Slash } from "lucide-react";

export default function BreadCrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").slice(2);

  console.log(segments.length);
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbPage className="capitalize md:hidden">
          {segments.length > 0 ? segments[0] : "Dashboard"}
        </BreadcrumbPage>

        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");

          return (
            <div className="items-center hidden gap-2 md:flex" key={href}>
              <BreadcrumbSeparator>
                <Slash />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {index === segments.length - 1 ? (
                  <BreadcrumbPage className="capitalize">
                    {decodeURIComponent(segment)}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href} className="capitalize">
                    {decodeURIComponent(segment)}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
