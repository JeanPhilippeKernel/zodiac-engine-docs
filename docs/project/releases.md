---
version: "1.0.0"
date: "2026-10-10"
navigation:
  - label: Release notes
    href: "#release-overview"
  - label: Changelog
    href: "#changelog"
  - label: Previous versions
    href: https://github.com/JeanPhilippeKernel/RendererEngine/releases
  - label: Requirements
    href: /getting-started/supported-platforms/
hero:
  eyebrow: THE 1.0 RELEASE
  title: ZEngine 1.0.0
  description: Your worlds. A stronger foundation.
  primary:
    label: Install ZEngine
    href: /getting-started/install-with-zodiac-engine-hub/
  secondary:
    label: What's new
    href: "#release-overview"
intro:
  title: A new chapter for your worlds.
  description: From scene simulation to the final frame, ZEngine 1.0 brings together the engine's core systems, Vulkan rendering, and asset workflow. A cross-platform foundation for the worlds you want to build.
facts:
  - value: C++20
    label: Modern engine core
  - value: Vulkan
    label: Rendering backend
  - value: 3 platforms
    label: Windows, Linux & macOS
features:
  - id: rendering-highlights
    eyebrow: RENDERING
    title: From scene to screen.
    description: A modernized render graph and a unified resource manager bring geometry, materials, and lighting together. Build your scene around a Vulkan rendering pipeline with explicit resource lifetimes.
    bullets:
      - Render graph with automatic resource barriers
      - Packed geometry buffers and bindless textures
      - HDRI environments and sky rendering
    link:
      label: Explore the rendering pipeline
      href: /reference/rendering/
    visual: rendering
    nodes: [Geometry, Lighting, Environment, Frame]
    caption: Rendering pipeline illustration
  - id: core-highlights
    eyebrow: CORE SYSTEMS
    title: A world that works together.
    description: A hybrid Actor-ECS architecture connects scene entities, components, and systems. Fixed-timestep simulation and a main-thread scheduler give each part of your world a clear place in the engine.
    bullets:
      - Hybrid Actor-ECS architecture
      - WorldTick system scheduling
      - Component reflection and scene transforms
    link:
      label: Discover the engine architecture
      href: /reference/architecture/
    visual: core
    nodes: [Actor-ECS, WorldTick, MainThreadScheduler]
    caption: Core architecture illustration
  - id: asset-highlights
    eyebrow: ASSET PIPELINE
    title: Give your assets a home.
    description: The virtual file system ties asset identity, importing, and storage together. Import meshes and textures into a consistent workflow, with stable UUIDs and VFS-backed paths.
    bullets:
      - GLB, glTF, and FBX mesh importing
      - Stable asset UUIDs and metadata sidecars
      - VFS-backed import and codec writes
    link:
      label: Follow the asset pipeline
      href: /reference/asset-pipeline/
    visual: assets
    nodes: [Import, Registry, VFS]
    caption: Asset workflow illustration
  - id: platform-highlights
    eyebrow: YOUR WORKFLOW
    title: Build on your terms.
    description: Start with a released build through Zodiac Engine Hub, or build the engine yourself with the supported CMake presets. Work with the same C++20 and Vulkan foundation across supported platforms.
    bullets:
      - Windows, Linux, and macOS support
      - Engine installation through Zodiac Engine Hub
      - Source builds with documented CMake presets
    link:
      label: Find your build instructions
      href: /development/build-from-source/
    visual: platforms
    nodes: [Windows, Linux, macOS]
    caption: Supported platform overview
notice:
  title: Updating an existing project?
  description: Version 1.0 changes asset-import and codec writes to VFS paths. Review the migration notes before opening an older project.
  link:
    label: Read migration notes
    href: "#breaking-change-vfs-backed-asset-import"
changelog:
  title: Every change has a story.
  description: Release notes, compatibility changes, and installation details for ZEngine 1.0.0.
  link:
    label: Full changelog on GitHub
    href: https://github.com/JeanPhilippeKernel/RendererEngine/blob/main/CHANGELOG.md
download:
  title: Your next world starts here.
  description: Install ZEngine through the Hub, or take the source route. The choice is yours.
  primary:
    label: Install ZEngine
    href: /getting-started/install-with-zodiac-engine-hub/
  secondary:
    label: Build from source
    href: /development/build-from-source/
---

# Releases and changelog

## ZEngine 1.0.0

**Released 2026-10-10** · [GitHub release](https://github.com/JeanPhilippeKernel/RendererEngine/releases/tag/v1.0.0)
· [Full changelog](https://github.com/JeanPhilippeKernel/RendererEngine/blob/main/CHANGELOG.md)

ZEngine 1.0.0 brings together the stable core
work across the ECS, native editor, asset pipeline, VFS, memory management, and
Vulkan rendering.

### Highlights

- A hybrid Actor-ECS architecture and WorldTick system scheduler.
- A modernized render graph, resource management, and bindless texture pipeline.
- GLB, glTF, and FBX importing with stable asset UUIDs and VFS-backed paths.
- Fixed-timestep simulation and main-thread scheduling.

For the complete list, read the [official 1.0.0 release notes](https://github.com/JeanPhilippeKernel/RendererEngine/releases/tag/v1.0.0).

### Breaking change: VFS-backed asset import

Importer and codec writes now use VFS paths. Review the 1.0.0 migration entries
before opening an existing project with the new version.

### Install the release

1. Download and install [Zodiac Engine Hub](https://github.com/JeanPhilippeKernel/ZodiacEngineHub/releases).
2. Open the Hub's engine-management view.
3. Select **ZEngine 1.0.0** and download/install it.
4. Create or open a project from the Hub.

See [Install ZEngine with the Hub](../getting-started/install-with-zodiac-engine-hub.md)
for the complete guided path.

## Release policy

Stable releases are published from `main`; the development track publishes
release candidates from `develop`. Release versions, changelog entries, tags,
and platform artifacts are produced by the repository's release automation.

For contributor-facing detail, see [Release process](../contributing/release-process.md).
