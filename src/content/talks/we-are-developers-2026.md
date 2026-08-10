---
title: "Stop Running Mystery Meat in Production"
event: "WeAreDevelopers World Congress 2026 - North America"
date: 2026-09-23
type: conference
tags: [containers, supply-chain-security, sbom, images, production]
conference_url: https://www.wearedevelopers.com/world-congress-north-america
featured: true
---

You wouldn't serve mystery meat to guests — so why are you running it in your Kubernetes clusters?

We have all been there. You need a database or a quick node environment, so you throw "FROM node:latest" into your Dockerfile and deploy. It works, but you have just introduced a black box into your Kubernetes cluster.

For the Developer, it’s a quick fix. For the Platform Engineer, it’s a nightmare.

Most organisations have surprisingly little visibility into what's actually inside their container images. Base images pulled from public registries, third-party libraries with unknown provenance, build tools accidentally left in production images — the attack surface is hiding in plain sight. In a world of Zero Trust, why are we trusting random upstream maintainers with the keys to our infrastructure?

In this session, we will dismantle the myth that "open source means secure" when it comes to container images. We will walk through the architecture of a truly Secure Software Delivery pipeline—one that establishes trust before a single line of code is committed. We will discuss:

- Why "it came from Docker Hub" is not a supply chain story
- SBOMs (Software Bill of Materials): what they are, why they matter
- Why scanning alone isn't enough: the need for SLSA L3 provenance and cryptographic attestation
- How to ensure that your production cluster is running only what you actually trust, without sacrificing developer velocity

Join us to learn how to bridge the gap between developer velocity and platform security, ensuring that the only thing running in your cluster is code you actually trust.
