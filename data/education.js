window.HOMEPAGE_DATA = window.HOMEPAGE_DATA || {};
{
const organizations = window.HOMEPAGE_DATA.organizations;

window.HOMEPAGE_DATA.education = [
    {
        logo: organizations.xmu.logo,
        logoWidth: organizations.xmu.logoWidth,
        logoHeight: organizations.xmu.logoHeight,
        institution: organizations.xmu.name,
        url: organizations.xmu.url,
        detail: "M.Eng. in Electronic Information (Artificial Intelligence)",
        location: "Xiamen",
        period: "2025.09 – Present",
        selected: true,
    },
    {
        logo: organizations.swufe.logo,
        logoWidth: organizations.swufe.logoWidth,
        logoHeight: organizations.swufe.logoHeight,
        institution: organizations.swufe.name,
        url: organizations.swufe.url,
        detail: "B.Eng. in Artificial Intelligence (Guanghua Experimental Class in Intelligent Finance)",
        location: "Chengdu",
        period: "2021.09 – 2025.06",
        selected: true,
    },
    {
        logo: "HZMHS.png",
        logoWidth: 512,
        logoHeight: 512,
        institution: "Hunan Zixing Municipal High School",
        detail: "High School Diploma",
        location: "Chenzhou",
        period: "2018.09 – 2021.06",
        selected: false,
    },
];
}
