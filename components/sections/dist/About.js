"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var image_1 = require("next/image");
var Icon_1 = require("@/components/ui/Icon");
var SectionHeading_1 = require("@/components/ui/SectionHeading");
var Reveal_1 = require("@/components/ui/Reveal");
var accents_1 = require("@/lib/accents");
var site_1 = require("@/lib/site");
/** Health / Wealth / Happiness as overlapping circles — the section's argument in one picture. */
function BalanceArtwork() {
    return (React.createElement("div", { className: "relative mx-auto w-full max-w-lg" },
        React.createElement("div", { className: "absolute inset-6 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(101,183,65,0.18),transparent_62%),radial-gradient(circle_at_74%_38%,rgba(30,136,229,0.16),transparent_62%),radial-gradient(circle_at_50%_82%,rgba(244,197,66,0.18),transparent_62%)] blur-2xl", "aria-hidden": "true" }),
        React.createElement(image_1["default"], { src: "/goal.webp", alt: "Wellness, Wealthiness and Happiness shown as three overlapping circles, with the Wellthyfy logo at the centre where all three meet.", width: 1000, height: 1000, sizes: "(max-width: 1024px) 90vw, 32rem", className: "relative w-full" })));
}
function About() {
    return (React.createElement("section", { id: "about", className: "relative scroll-mt-28 py-20 " },
        React.createElement("div", { className: "container-page" },
            React.createElement("div", { className: "grid items-center gap-14 lg:grid-cols-2 lg:gap-16" },
                React.createElement(Reveal_1.Reveal, { direction: "right" },
                    React.createElement(BalanceArtwork, null)),
                React.createElement("div", null,
                    React.createElement(Reveal_1.Reveal, { direction: "left" },
                        React.createElement(SectionHeading_1.Eyebrow, null, "About Wellthyfy")),
                    React.createElement(Reveal_1.Reveal, { direction: "left", delay: 0.08 },
                        React.createElement("h2", { className: "mt-6 text-3xl font-semibold leading-[1.14] sm:text-4xl lg:text-[2.7rem]" },
                            "A holistic lifestyle company built on",
                            " ",
                            React.createElement("span", { className: "text-gradient-brand" }, "balance"))),
                    React.createElement(Reveal_1.Reveal, { direction: "left", delay: 0.14 },
                        React.createElement("p", { className: "mt-6 text-base leading-relaxed text-ink-soft sm:text-lg" }, "Wellthyfy Lifestyle Ventures Pvt. Ltd. is a holistic lifestyle company dedicated to empowering individuals and communities to achieve balanced and fulfilling lives.")),
                    React.createElement(Reveal_1.Reveal, { direction: "left", delay: 0.2 },
                        React.createElement("p", { className: "mt-5 border-l-2 border-gold-400 pl-5 font-display text-lg font-medium leading-relaxed text-navy-800 sm:text-xl" }, "We believe true success comes when Health, Wealth and Happiness grow together.")),
                    React.createElement(Reveal_1.Reveal, { direction: "left", delay: 0.28 },
                        React.createElement("a", { href: "#services", className: "group mt-8 inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white/80 px-6 py-3.5 text-sm font-semibold text-navy-800 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-soft" },
                            "See what we do",
                            React.createElement(lucide_react_1.ArrowRight, { className: "size-4 transition-transform duration-300 group-hover:translate-x-1" }))))),
            React.createElement(Reveal_1.StaggerGroup, { className: "mt-20 grid gap-6 md:grid-cols-3 lg:mt-24 lg:gap-7" }, site_1.pillars.map(function (pillar) {
                var a = accents_1.accentStyles[pillar.accent];
                return (React.createElement(Reveal_1.StaggerItem, { key: pillar.title },
                    React.createElement("article", { className: accents_1.cn("group relative h-full overflow-hidden rounded-3xl border border-navy-900/7 bg-white/85 p-7 shadow-soft backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-lift ring-brand-hover") },
                        React.createElement("span", { className: accents_1.cn("pointer-events-none absolute -right-16 -top-16 size-40 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100", a.tintBg) }),
                        React.createElement("span", { className: accents_1.cn("relative grid size-14 place-items-center rounded-2xl text-white transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6", a.iconTile, a.glow) },
                            React.createElement(Icon_1.Icon, { name: pillar.icon, className: "size-7" })),
                        React.createElement("h3", { className: "relative mt-6 text-xl font-semibold sm:text-[1.35rem]" }, pillar.title),
                        React.createElement("p", { className: "relative mt-2.5 text-sm leading-relaxed text-ink-soft" }, pillar.blurb),
                        React.createElement("ul", { className: "relative mt-6 space-y-3 border-t border-navy-900/7 pt-5" }, pillar.points.map(function (point) { return (React.createElement("li", { key: point, className: "flex items-center gap-3 text-[0.95rem] text-ink" },
                            React.createElement("span", { className: accents_1.cn("grid size-5 shrink-0 place-items-center rounded-full", a.softBg) },
                                React.createElement(lucide_react_1.Check, { className: accents_1.cn("size-3", a.text), strokeWidth: 3.2 })),
                            point)); })),
                        React.createElement("span", { className: accents_1.cn("absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100", a.bar) }))));
            })))));
}
exports["default"] = About;
