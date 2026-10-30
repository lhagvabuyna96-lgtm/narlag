<?php

function narlag_icon(string $name): string
{
    $icons = [
        "mower" => '<svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true"><rect x="6" y="28" width="36" height="16" rx="5"/><path d="M38 30h16a4 4 0 0 1 4 4v6H40z"/><circle cx="18" cy="48" r="8"/><circle cx="40" cy="48" r="8"/><circle cx="18" cy="48" r="3" fill="#f4fbe8"/><circle cx="40" cy="48" r="3" fill="#f4fbe8"/><path d="M16 28c2-12 10-16 18-10" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>',
        "trimmer" => '<svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true"><path d="M14 54c10-2 12-14 8-24 6-4 16-16 22-22 2 6-2 14-8 18-2 8-8 20-16 24-4 2-6 4-6 4z"/><circle cx="16" cy="52" r="6"/><path d="M42 14c8 2 12 8 10 14" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>',
        "reel" => '<svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true"><rect x="10" y="26" width="34" height="18" rx="9"/><rect x="16" y="16" width="22" height="12" rx="3"/><path d="M36 18h18v6H38z"/><circle cx="20" cy="50" r="8"/><circle cx="40" cy="50" r="8"/><circle cx="20" cy="50" r="3" fill="#f4fbe8"/><circle cx="40" cy="50" r="3" fill="#f4fbe8"/></svg>',
        "edger" => '<svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true"><rect x="28" y="6" width="8" height="36" rx="4"/><path d="M18 8h28v8H18z"/><circle cx="32" cy="48" r="12"/><rect x="30" y="38" width="4" height="20" fill="#f4fbe8"/><rect x="22" y="46" width="20" height="4" fill="#f4fbe8"/></svg>',
        "spool" => '<svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true"><circle cx="30" cy="32" r="18"/><circle cx="30" cy="32" r="7" fill="#f4fbe8"/><path d="M46 28c8 0 12 6 12 12" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>',
        "chainsaw" => '<svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true"><rect x="4" y="26" width="30" height="18" rx="5"/><rect x="30" y="30" width="28" height="8" rx="2"/><circle cx="16" cy="35" r="4" fill="#f4fbe8"/><path d="M10 44h14v6H10z"/><path d="M34 34h20" stroke="#f4fbe8" stroke-width="2"/></svg>',
        "lopper" => '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" aria-hidden="true"><path d="M10 56L32 28"/><path d="M54 56L32 28"/><path d="M32 28V8"/><circle cx="32" cy="28" r="4" fill="currentColor" stroke="none"/></svg>',
        "saw" => '<svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true"><path d="M4 24h36l6 8-6 8H4z"/><rect x="40" y="28" width="20" height="8" rx="3"/><path d="M12 40v8M20 40v8M28 40v8M36 40v8" stroke="currentColor" stroke-width="3"/></svg>',
        "ladder" => '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" aria-hidden="true"><path d="M18 6L10 58"/><path d="M46 6l8 52"/><path d="M14 20h36M12 34h40M11 48h42"/></svg>',
        "oil" => '<svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true"><rect x="24" y="6" width="16" height="10" rx="3"/><path d="M18 16h28l4 10v20a10 10 0 0 1-10 10H24A10 10 0 0 1 14 46V26z"/><rect x="24" y="30" width="16" height="16" rx="3" fill="#f4fbe8"/></svg>',
        "barrow" => '<svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true"><path d="M8 24h34l10 18H16z"/><circle cx="24" cy="50" r="9"/><circle cx="24" cy="50" r="3" fill="#f4fbe8"/><path d="M14 24L6 46M46 42h14" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>',
        "rake" => '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" aria-hidden="true"><path d="M14 58L42 16"/><path d="M30 12h26"/><path d="M34 12v16M42 12v16M50 12v16"/></svg>',
        "hose" => '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" aria-hidden="true"><circle cx="28" cy="34" r="14"/><circle cx="28" cy="34" r="5"/><path d="M42 30h10l6 10v12"/></svg>',
        "gloves" => '<svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true"><path d="M14 34c0-8 6-10 10-6 1-8 8-10 12-4 2-7 10-6 13 1 5-2 11 3 9 9l-3 16c-1 8-8 12-16 12h-8c-9 0-17-7-17-16z"/><path d="M20 30V16M30 24V12M40 26V14" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity=".35"/></svg>',
        "safety" => '<svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true"><path d="M8 36c8-12 14-12 20 0-2 6-6 8-10 8s-8-2-10-8z"/><path d="M36 36c6-12 12-12 20 0-2 6-6 8-10 8s-8-2-10-8z"/><path d="M22 12h20l6 10H16z"/><rect x="28" y="34" width="8" height="6" rx="2"/></svg>',
    ];

    return $icons[$name] ?? "";
}
