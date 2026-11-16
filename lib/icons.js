import ArrowRight from "@lucide/icons/icons/arrow-right";
import ArrowUp from "@lucide/icons/icons/arrow-up";
import ArrowUpRight from "@lucide/icons/icons/arrow-up-right";
import CodeXml from "@lucide/icons/icons/code-xml";
import Drone from "@lucide/icons/icons/drone";
import FileText from "@lucide/icons/icons/file-text";
import Heart from "@lucide/icons/icons/heart";
import Pause from "@lucide/icons/icons/pause";
import Play from "@lucide/icons/icons/play";
import RotateCcw from "@lucide/icons/icons/rotate-ccw";
import Search from "@lucide/icons/icons/search";
import X from "@lucide/icons/icons/x";
import { buildLucideSvg } from "@lucide/icons/build";

const icons = new Map([
  ["arrow-right", ArrowRight],
  ["arrow-up", ArrowUp],
  ["arrow-up-right", ArrowUpRight],
  ["code-xml", CodeXml],
  ["drone", Drone],
  ["file-text", FileText],
  ["heart", Heart],
  ["pause", Pause],
  ["play", Play],
  ["rotate-ccw", RotateCcw],
  ["search", Search],
  ["x", X],
]);

export function renderIcon(name, className = "", size = 16) {
  const icon = icons.get(name);
  if (!icon) throw new Error(`Unknown icon: ${name}`);

  return buildLucideSvg(icon, {
    size,
    className: `icon ${className}`.trim(),
    attributes: { "aria-hidden": "true", focusable: "false" },
  });
}
