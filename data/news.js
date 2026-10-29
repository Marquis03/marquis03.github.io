window.HOMEPAGE_DATA = window.HOMEPAGE_DATA || {};
{
const organizations = window.HOMEPAGE_DATA.organizations;
const organizationLink = (organization, label = organization.name) =>
    `<a class="affiliation-link" href="${organization.url}"${label === organization.name ? "" : ` aria-label="${organization.name}"`}><img src="assets/images/logos/${organization.logo}" alt="" aria-hidden="true" width="${organization.logoWidth}" height="${organization.logoHeight}">${label}</a>`;

window.HOMEPAGE_DATA.news = {
    visibleCount: 3,
    entries: [
        {
            date: "2026.05",
            content:
                `Started my internship at ${organizationLink(organizations.unisound, organizations.unisound.shortName)} in Xiamen, working on Code Agent optimization.`,
        },
        {
            date: "2025.11",
            content:
                'Won <strong>Second Place</strong> in the <a href="https://challenge.xfyun.cn/topic/info?type=domain-term-translation">iFLYTEK AI Developer Competition — Domain Term Translation Challenge</a>.',
        },
        {
            date: "2025.09",
            content:
                `Started my M.Eng. in Electronic Information, specializing in Artificial Intelligence at ${organizationLink(organizations.xmu, organizations.xmu.shortName)}.`,
        },
        {
            date: "2025.08",
            content:
                'Received the <strong>Rookie Award</strong> in <a href="https://tianchi.aliyun.com/competition/entrance/532353">AFAC2025 — Financial Long Chain-of-Thought Compression</a>.',
        },
        {
            date: "2025.06",
            content:
                `Graduated from ${organizationLink(organizations.swufe, organizations.swufe.shortName)} with a B.Eng. in Artificial Intelligence.`,
        },
        {
            date: "2025.02",
            content:
                'Started as an LLM Algorithm Intern at <a href="https://www.dp.tech/">DP Technology</a>.',
        },
        {
            date: "2024.11",
            content:
                'Received <strong>Honorable Mention</strong> in the <a href="https://competition.ai4s.com.cn/">2nd World AI4S Prize</a>.',
        },
        {
            date: "2023.12",
            content:
                'Received <strong>Honorable Mention</strong> in the <a href="https://tianchi.aliyun.com/competition/entrance/532116">CFFF Prize</a>.',
        },
        {
            date: "2023.12",
            content:
                'Received the <strong>Merit Award</strong> in the <a href="https://tianchi.aliyun.com/competition/entrance/532155">Global Intelligent Vehicle AI Challenge</a>.',
        },
        {
            date: "2023.10",
            content:
                'Won the <strong>Bronze Medal</strong> in the <a href="assets/certificates/2023_ICPC_Xian_Regional_Bronze.pdf">ICPC Asia Xi\'an Regional Contest</a>.',
        },
    ],
};
}
