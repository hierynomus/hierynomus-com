---
title: "Stop Running Mystery Meat in Production"
event: "Cloud Native London"
date: 2026-02-04
type: meetup
tags: [containers, supply-chain-security, sbom, images, production]
conference_url: https://www.meetup.com/cloud-native-london/events/310408638/
video_url: https://www.youtube.com/live/ycjbonELfNw?si=UUHl54C0dv0z41Xe&t=702
featured: true
---

<!-- Abstract placeholder — replace with final abstract -->

You wouldn't serve mystery meat to guests — so why are you running it in your Kubernetes clusters?

Most organisations have surprisingly little visibility into what's actually inside their container images. Base images pulled from public registries, third-party libraries with unknown provenance, build tools accidentally left in production images — the attack surface is hiding in plain sight.

This talk tackles the uncomfortable question: **do you actually know what's running in production?**

We'll cover:

- Why "it came from Docker Hub" is not a supply chain story
- SBOMs (Software Bill of Materials): what they are, why they matter, and how to generate them
- Image signing and verification with Cosign and Notary
- Practical approaches to building a trusted image pipeline without slowing your teams down
- What to do when you discover something unexpected is already running

Opinionated, practical, and light on theory — with real examples of what goes wrong when you don't know what's in your containers.
