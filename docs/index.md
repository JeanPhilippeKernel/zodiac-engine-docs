---
version: "1.0.0"
title: Build worlds with Zodiac Engine
description: A cross-platform C++20 and Vulkan engine for modern games, featuring a flexible asset pipeline and Zodiac Engine Hub (Panzerfaust) for streamlined project management and distribution.
primary:
  label: Install ZEngine
  href: /getting-started/install-with-zodiac-engine-hub/
secondary:
  label: Build from source
  href: /development/build-from-source/
pathways:
  title: Start where you are
  description: Whether you're new to the engine or ready to dive into the code, here are the best places to begin your journey with Zodiac Engine.
  cards:
    - title: Install the engine
      icon: download
      description: Get up and running quickly with the latest release for your platform. Follow a few simple steps and start creating.
      href: /getting-started/install-with-zodiac-engine-hub/
      link: View installation guide
    - title: Develop from source
      icon: code
      description: Set up your development environment and build the engine from source. Get full control and customize it to your needs.
      href: /development/build-from-source/
      link: View build instructions
    - title: Understand the engine
      icon: book
      description: Dive into the architecture, core systems, and key concepts that power Zodiac Engine.
      href: /reference/
      link: Read the reference
ecosystem:
  title: What is included
  description: Zodiac Engine comes with a complete set of tools to help you create, manage and ship your projects, from the engine core to the distribution pipeline.
  cards:
    - title: ZEngine
      icon: box
      subtitle: The core runtime and rendering engine.
      description: A cross-platform engine built with C++20 and Vulkan, designed for flexibility, performance and long-term support.
      features:
        - Cross-platform (Windows, Linux, macOS)
        - C++20 modern codebase
        - Vulkan rendering backend
      href: /reference/architecture/
      link: Learn more about ZEngine
    - title: Zodiac Engine Hub
      icon: cloud
      subtitle: Project management and distribution.
      description: Panzerfaust, our launcher and project manager, installs engine versions and creates or opens your projects.
      features:
        - Engine installation and updates
        - Engine version selection
        - Project creation and management
      href: /getting-started/install-with-zodiac-engine-hub/
      link: Learn about Panzerfaust
---

## Current release

ZEngine **1.0.0** is the current stable release. It includes the 1.0 engine
and importer work. The asset-importer migration uses VFS paths; consult
the [1.0.0 changelog](project/releases.md#zengine-100) before updating existing
projects.

## Need help?

- Read the [getting-started guide](getting-started/index.md).
- Search this documentation with the control at the top of the page.
- Ask the community on [Discord](https://discord.gg/jC3GPVKKsW).
- Report confirmed bugs in the [issue tracker](https://github.com/JeanPhilippeKernel/RendererEngine/issues).
