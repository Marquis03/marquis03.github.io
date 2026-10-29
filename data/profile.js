window.HOMEPAGE_DATA = window.HOMEPAGE_DATA || {};
{
const organizations = window.HOMEPAGE_DATA.organizations;
const xmu = organizations.xmu;
const swufe = organizations.swufe;
const unisound = organizations.unisound;
const organizationLink = (organization, label = organization.name) =>
    `<a class="affiliation-link" href="${organization.url}"${label === organization.name ? "" : ` aria-label="${organization.name}"`}><img src="assets/images/logos/${organization.logo}" alt="" aria-hidden="true" width="${organization.logoWidth}" height="${organization.logoHeight}">${label}</a>`;

window.HOMEPAGE_DATA.profile = {
    name: "Jue Hou",
    chineseName: "侯爵",
    avatar: "assets/images/avatar.jpg",
    avatarAlt: "Portrait of Jue Hou",
    avatarWidth: 1080,
    avatarHeight: 1080,
    caption: "Photographed in<br>Dujiangyan City, Sichuan, China",
    metadata: {
        siteUrl: "https://marquis03.github.io/",
        description:
            "Jue Hou — M.Eng. student in Electronic Information, specializing in Artificial Intelligence at Xiamen University, researching LLM reasoning and agentic reinforcement learning.",
        jobTitle:
            "M.Eng. Student in Electronic Information, specializing in Artificial Intelligence",
        affiliation: {
            name: xmu.name,
            url: xmu.url,
        },
        alumniOf: {
            name: swufe.name,
            url: swufe.url,
        },
    },
    bio: [
        `I am an M.Eng. student in Electronic Information, specializing in Artificial Intelligence at ${organizationLink(xmu)}, advised by <a href="https://scholar.google.com/citations?user=w6qCk3sAAAAJ">Prof. Jinsong Su</a>. I am currently a Model Optimization Intern at ${organizationLink(unisound, unisound.shortName)}, working on Code Agent optimization.`,
        "My research focuses on <strong>LLM reasoning and agentic reinforcement learning</strong>. I welcome research collaborations and opportunities to work on challenging AI projects.",
    ],
    links: [
        { label: "Email", url: "mailto:marquis03@qq.com", icon: "email.svg" },
        {
            label: "GitHub",
            url: "https://github.com/Marquis03",
            icon: "github.svg",
        },
        {
            label: "Google Scholar",
            url: "https://scholar.google.com/citations?user=GoceuAsAAAAJ",
            icon: "google-scholar.svg",
        },
        {
            label: "Semantic Scholar",
            url: "https://www.semanticscholar.org/author/Jue-Hou/2367598435",
            icon: "semantic-scholar.svg",
        },
    ],
};
}
