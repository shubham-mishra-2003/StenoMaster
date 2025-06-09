"use client";
import { useTheme } from "@/hooks/ThemeProvider";

interface FooterProps {
  siteName?: string;
  tagline?: string;
  links?: { label: string; href: string }[];
}

const Footer = ({
  siteName = "StenoLearn",
  tagline = "Built for educational excellence.",
  links = [],
}: FooterProps) => {
  const { colorScheme } = useTheme();
  const year = new Date().getFullYear();

  return (
    <footer
      className={`border-t border-border/50 py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-r backdrop-blur-lg transition-all duration-300 ${
        colorScheme === "dark"
          ? "from-gray-900/70 via-blue-950/50 to-purple-950/50"
          : "from-white/70 via-blue-50/50 to-purple-50/50"
      }`}
    >
      <div className="max-w-7xl mx-auto text-center space-y-2">
        <p
          className={`text-sm font-medium ${
            colorScheme === "dark" ? "text-gray-300" : "text-gray-600"
          }`}
        >
          © {year} {siteName}. {tagline}
        </p>
        {links.length > 0 && (
          <div className="flex justify-center flex-wrap gap-4 text-xs">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`hover:underline ${
                  colorScheme === "dark" ? "text-gray-400" : "text-gray-700"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;