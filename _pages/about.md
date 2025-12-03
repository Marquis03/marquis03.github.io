---
permalink: /
title: ""
excerpt: ""
author_profile: true
redirect_from:
  - /about/
  - /about.html
---

{% if site.google_scholar_stats_use_cdn %}
{% assign gsDataBaseUrl = "<https://cdn.jsdelivr.net/gh/>" | append: site.repository | append: "@" %}
{% else %}
{% assign gsDataBaseUrl = "<https://raw.githubusercontent.com/>" | append: site.repository | append: "/" %}
{% endif %}
{% assign url = gsDataBaseUrl | append: "google-scholar-stats/gs_data_shieldsio.json" %}

<p class='anchor' id='top'></p>

{% include_relative includes/introduction.md %}

{% include_relative includes/news.md %}

{% include_relative includes/publications.md %}

{% include_relative includes/competitions.md %}

{% include_relative includes/educations.md %}

{% include_relative includes/experiences.md %}

<!-- <a href='https://scholar.google.com/citations?user=GoceuAsAAAAJ'><img src="https://img.shields.io/endpoint?url={{ url | url_encode }}&logo=googlescholar&labelColor=F5F5F5&color=4D90FE&label=Citations"></a> -->