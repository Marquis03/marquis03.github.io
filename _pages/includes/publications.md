{% if site.google_scholar_stats_use_cdn %}
{% assign gsDataBaseUrl = "<https://cdn.jsdelivr.net/gh/>" | append: site.repository | append: "@" %}
{% else %}
{% assign gsDataBaseUrl = "<https://raw.githubusercontent.com/>" | append: site.repository | append: "/" %}
{% endif %}
{% assign url = gsDataBaseUrl | append: "google-scholar-stats/gs_data_shieldsio.json" %}

# 📚 Publications

<!-- <a href='https://scholar.google.com/citations?user=GoceuAsAAAAJ'><img src="https://img.shields.io/endpoint?url={{ url | url_encode }}&logo=Google%20Scholar&labelColor=f6f6f6&color=9cf&style=flat&label=citations"></a> -->

<p>* Equal contribution, † Corresponding author</p>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">arXiv 2506</div><img src='images/pub/MM-R5.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[MM-R5: MultiModal Reasoning-Enhanced ReRanker via Reinforcement Learning for Document Retrieval](https://arxiv.org/pdf/2506.12364)

Mingjun Xu\*, Jinhan Dong\*, <strong>Jue Hou\*</strong>, Zehui Wang, Sihang Li, Zhifeng Gao, Renxin Zhong, Hengxing Cai†

- [![arXiv](https://img.shields.io/badge/arXiv-B31B1B?logo=arxiv)](https://arxiv.org/abs/2506.12364) [![GitHub](https://img.shields.io/badge/GitHub-1F2328?logo=github)](https://github.com/i2vec/MM-R5) [![Hugging Face](https://img.shields.io/badge/🤗_Hugging_Face-blue)](https://huggingface.co/i2vec/MM-R5)

</div>
</div>

- ``arXiv 2506`` [Doc2SAR: A Synergistic Framework for High-Fidelity Extraction of Structure-Activity Relationships from Scientific Documents](https://arxiv.org/pdf/2506.21625). Jiaxi Zhuang\*, Kangning Li\*, <strong>Jue Hou</strong>, Mingjun Xu, Zhifeng Gao, Hengxing Cai†.
