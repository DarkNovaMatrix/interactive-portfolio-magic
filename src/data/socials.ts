// Update the URLs to your real handles.
export type Social = {
  name: string;
  handle: string;
  url: string;
  category: "code" | "social" | "professional" | "contact";
};

export const SOCIALS: Social[] = [
  { name: "GitHub",     handle: "@amishkumar",       url: "https://github.com/amishkumar",           category: "code" },
  { name: "LeetCode",   handle: "amishkumar",        url: "https://leetcode.com/amishkumar",         category: "code" },
  { name: "HackerRank", handle: "amishkumar",        url: "https://hackerrank.com/amishkumar",       category: "code" },
  { name: "CodeChef",   handle: "amishkumar",        url: "https://codechef.com/users/amishkumar",   category: "code" },

  { name: "LinkedIn",   handle: "Amish Kumar",       url: "https://linkedin.com/in/amishkumar",      category: "professional" },
  { name: "Figma",      handle: "@amishkumar",       url: "https://figma.com/@amishkumar",           category: "professional" },
  { name: "Medium",     handle: "@amishkumar",       url: "https://medium.com/@amishkumar",          category: "professional" },

  { name: "Twitter / X",handle: "@amishkumar",       url: "https://x.com/amishkumar",                category: "social" },
  { name: "Instagram",  handle: "@amish.kumar",      url: "https://instagram.com/amish.kumar",       category: "social" },
  { name: "YouTube",    handle: "@amishkumar",       url: "https://youtube.com/@amishkumar",         category: "social" },
  { name: "Discord",    handle: "amishkumar",        url: "https://discord.com/users/amishkumar",    category: "social" },

  { name: "Email",      handle: "hello@amishkumar.dev", url: "mailto:hello@amishkumar.dev",          category: "contact" },
];
