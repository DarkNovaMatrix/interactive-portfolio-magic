export type Social = {
  name: string;
  handle: string;
  url: string;
  category: "code" | "social" | "professional" | "contact";
};

export const HANDLES = {
  github: "Zero-Day-Smile",
  leetcode: "Zero-Day-Smile",
  codeforces: "Zero-Day-Smile",
  codechef: "zerodaysmile",
  gfg: "ak25yvo4",
  hackerrank: "ZeroDaySmile",
  code360: "ZeroDaySmile",
  linkedin: "amishkumarofficial",
} as const;

export const SOCIALS: Social[] = [
  { name: "GitHub",     handle: "@Zero-Day-Smile", url: `https://github.com/${HANDLES.github}`,                              category: "code" },
  { name: "LeetCode",   handle: "Zero-Day-Smile",  url: `https://leetcode.com/u/${HANDLES.leetcode}`,                        category: "code" },
  { name: "Codeforces", handle: "Zero-Day-Smile",  url: `https://codeforces.com/profile/${HANDLES.codeforces}`,              category: "code" },
  { name: "CodeChef",   handle: "zerodaysmile",    url: `https://www.codechef.com/users/${HANDLES.codechef}`,                category: "code" },
  { name: "GeeksforGeeks", handle: "ak25yvo4",     url: `https://www.geeksforgeeks.org/user/${HANDLES.gfg}`,                 category: "code" },
  { name: "HackerRank", handle: "ZeroDaySmile",    url: `https://www.hackerrank.com/profile/${HANDLES.hackerrank}`,          category: "code" },
  { name: "Code360",    handle: "ZeroDaySmile",    url: `https://www.naukri.com/code360/profile/${HANDLES.code360}`,         category: "code" },

  { name: "LinkedIn",   handle: "Amish Kumar",     url: `https://www.linkedin.com/in/${HANDLES.linkedin}`,                   category: "professional" },

  { name: "Email",      handle: "hello@amishkumar.dev", url: "mailto:hello@amishkumar.dev",                                  category: "contact" },
];
