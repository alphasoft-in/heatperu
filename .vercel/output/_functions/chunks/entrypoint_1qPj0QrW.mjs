import '@vercel/routing-utils';
import nodePath from 'node:path';
import colors from 'piccolore';
import { parse, stringify as stringify$1, unflatten as unflatten$1 } from 'devalue';
import 'es-module-lexer';
import { serialize, parse as parse$1 } from 'cookie';
import { escape } from 'html-escaper';
import { clsx } from 'clsx';
import { decodeBase64, encodeBase64, decodeHex, encodeHexUpperCase } from '@oslojs/encoding';
import * as z from 'zod/v4';
import { createStorage } from 'unstorage';
import React, { memo, createElement } from 'react';
import ReactDOM from 'react-dom/server';

function normalizeLF(code) {
  return code.replace(/\r\n|\r(?!\n)|\n/g, "\n");
}

function codeFrame(src, loc) {
  if (!loc || loc.line === void 0 || loc.column === void 0) {
    return "";
  }
  const lines = normalizeLF(src).split("\n").map((ln) => ln.replace(/\t/g, "  "));
  const visibleLines = [];
  for (let n = -2; n <= 2; n++) {
    if (lines[loc.line + n]) visibleLines.push(loc.line + n);
  }
  let gutterWidth = 0;
  for (const lineNo of visibleLines) {
    let w = `> ${lineNo}`;
    if (w.length > gutterWidth) gutterWidth = w.length;
  }
  let output = "";
  for (const lineNo of visibleLines) {
    const isFocusedLine = lineNo === loc.line - 1;
    output += isFocusedLine ? "> " : "  ";
    output += `${lineNo + 1} | ${lines[lineNo]}
`;
    if (isFocusedLine)
      output += `${Array.from({ length: gutterWidth }).join(" ")}  | ${Array.from({
        length: loc.column
      }).join(" ")}^
`;
  }
  return output;
}

class AstroError extends Error {
  loc;
  title;
  hint;
  frame;
  type = "AstroError";
  constructor(props, options) {
    const { name, title, message, stack, location, hint, frame } = props;
    super(message, options);
    this.title = title;
    this.name = name;
    if (message) this.message = message;
    this.stack = stack ? stack : this.stack;
    this.loc = location;
    this.hint = hint;
    this.frame = frame;
  }
  setLocation(location) {
    this.loc = location;
  }
  setName(name) {
    this.name = name;
  }
  setMessage(message) {
    this.message = message;
  }
  setHint(hint) {
    this.hint = hint;
  }
  setFrame(source, location) {
    this.frame = codeFrame(source, location);
  }
  static is(err) {
    return err?.type === "AstroError";
  }
}

const ClientAddressNotAvailable = {
  name: "ClientAddressNotAvailable",
  title: "`Astro.clientAddress` is not available in current adapter.",
  message: (adapterName) => `\`Astro.clientAddress\` is not available in the \`${adapterName}\` adapter. File an issue with the adapter to add support.`
};
const PrerenderClientAddressNotAvailable = {
  name: "PrerenderClientAddressNotAvailable",
  title: "`Astro.clientAddress` cannot be used inside prerendered routes.",
  message: (name) => `\`Astro.clientAddress\` cannot be used inside prerendered route ${name}.`
};
const StaticClientAddressNotAvailable = {
  name: "StaticClientAddressNotAvailable",
  title: "`Astro.clientAddress` is not available in prerendered pages.",
  message: "`Astro.clientAddress` is only available on pages that are server-rendered.",
  hint: "See https://docs.astro.build/en/guides/on-demand-rendering/ for more information on how to enable SSR."
};
const NoMatchingStaticPathFound = {
  name: "NoMatchingStaticPathFound",
  title: "No static path found for requested path.",
  message: (pathName) => `A \`getStaticPaths()\` route pattern was matched, but no matching static path was found for requested path \`${pathName}\`.`,
  hint: (possibleRoutes) => `Possible dynamic routes being matched: ${possibleRoutes.join(", ")}.`
};
const OnlyResponseCanBeReturned = {
  name: "OnlyResponseCanBeReturned",
  title: "Invalid type returned by Astro page.",
  message: (route, returnedValue) => `Route \`${route ? route : ""}\` returned a \`${returnedValue}\`. Only a [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) can be returned from Astro files.`,
  hint: "See https://docs.astro.build/en/guides/on-demand-rendering/#response for more information."
};
const MissingMediaQueryDirective = {
  name: "MissingMediaQueryDirective",
  title: "Missing value for `client:media` directive.",
  message: 'Media query not provided for `client:media` directive. A media query similar to `client:media="(max-width: 600px)"` must be provided.'
};
const NoMatchingRenderer = {
  name: "NoMatchingRenderer",
  title: "No matching renderer found.",
  message: (componentName, componentExtension, plural, validRenderersCount) => `Unable to render \`${componentName}\`.

${validRenderersCount > 0 ? `There ${plural ? "are" : "is"} ${validRenderersCount} renderer${plural ? "s" : ""} configured in your \`astro.config.mjs\` file,
but ${plural ? "none were" : "it was not"} able to server-side render \`${componentName}\`.` : `No valid renderer was found ${componentExtension ? `for the \`.${componentExtension}\` file extension.` : `for this file extension.`}`}`,
  hint: (probableRenderers) => `Did you mean to enable the ${probableRenderers} integration?

See https://docs.astro.build/en/guides/framework-components/ for more information on how to install and configure integrations.`
};
const NoClientOnlyHint = {
  name: "NoClientOnlyHint",
  title: "Missing hint on client:only directive.",
  message: (componentName) => `Unable to render \`${componentName}\`. When using the \`client:only\` hydration strategy, Astro needs a hint to use the correct renderer.`,
  hint: (probableRenderers) => `Did you mean to pass \`client:only="${probableRenderers}"\`? See https://docs.astro.build/en/reference/directives-reference/#clientonly for more information on \`client:only\`.`
};
const InvalidGetStaticPathsEntry = {
  name: "InvalidGetStaticPathsEntry",
  title: "Invalid entry inside `getStaticPaths()`'s return value.",
  message: (entryType) => `Invalid entry returned by \`getStaticPaths()\`. Expected an object, got \`${entryType}\`.`,
  hint: "If you're using a `.map` call, you might be looking for `.flatMap()` instead. See https://docs.astro.build/en/reference/routing-reference/#getstaticpaths for more information on `getStaticPaths()`."
};
const InvalidGetStaticPathsReturn = {
  name: "InvalidGetStaticPathsReturn",
  title: "Invalid value returned by `getStaticPaths()`.",
  message: (returnType) => `Invalid type returned by \`getStaticPaths()\`. Expected an \`array\`, got \`${returnType}\`.`,
  hint: "See https://docs.astro.build/en/reference/routing-reference/#getstaticpaths for more information on `getStaticPaths()`."
};
const GetStaticPathsExpectedParams = {
  name: "GetStaticPathsExpectedParams",
  title: "Missing params property on `getStaticPaths()` route.",
  message: "Missing or empty required `params` property on `getStaticPaths()` route.",
  hint: "See https://docs.astro.build/en/reference/routing-reference/#getstaticpaths for more information on `getStaticPaths()`."
};
const GetStaticPathsInvalidRouteParam = {
  name: "GetStaticPathsInvalidRouteParam",
  title: "Invalid route parameter returned by `getStaticPaths()`.",
  message: (key, value, valueType) => `Invalid \`getStaticPaths()\` route parameter for \`${key}\`. Expected a string or undefined, received \`${valueType}\` (\`${value}\`).`,
  hint: "See https://docs.astro.build/en/reference/routing-reference/#getstaticpaths for more information on `getStaticPaths()`."
};
const GetStaticPathsRequired = {
  name: "GetStaticPathsRequired",
  title: "`getStaticPaths()` function required for dynamic routes.",
  message: "`getStaticPaths()` function is required for dynamic routes. Make sure that you `export` a `getStaticPaths()` function from your dynamic route.",
  hint: `See https://docs.astro.build/en/guides/routing/#dynamic-routes for more information on dynamic routes.

	If you meant for this route to be server-rendered, set \`export const prerender = false;\` in the page.`
};
const ReservedSlotName = {
  name: "ReservedSlotName",
  title: "Invalid slot name.",
  message: (slotName) => `Unable to create a slot named \`${slotName}\`. \`${slotName}\` is a reserved slot name. Please update the name of this slot.`
};
const NoMatchingImport = {
  name: "NoMatchingImport",
  title: "No import found for component.",
  message: (componentName) => `Could not render \`${componentName}\`. No matching import has been found for \`${componentName}\`.`,
  hint: "Please make sure the component is properly imported."
};
const InvalidComponentArgs = {
  name: "InvalidComponentArgs",
  title: "Invalid component arguments.",
  message: (name) => `Invalid arguments passed to${name ? ` <${name}>` : ""} component.`,
  hint: "Astro components cannot be rendered directly via function call, such as `Component()` or `{items.map(Component)}`."
};
const PageNumberParamNotFound = {
  name: "PageNumberParamNotFound",
  title: "Page number param not found.",
  message: (paramName) => `[paginate()] page number param \`${paramName}\` not found in your filepath.`,
  hint: "Rename your file to `[page].astro` or `[...page].astro`."
};
const ImageMissingAlt = {
  name: "ImageMissingAlt",
  title: 'Image missing required "alt" property.',
  message: 'Image missing "alt" property. "alt" text is required to describe important images on the page.',
  hint: 'Use an empty string ("") for decorative images.'
};
const InvalidImageService = {
  name: "InvalidImageService",
  title: "Error while loading image service.",
  message: "There was an error loading the configured image service. Please see the stack trace for more information."
};
const MissingImageDimension = {
  name: "MissingImageDimension",
  title: "Missing image dimensions.",
  message: (missingDimension, imageURL) => `Missing ${missingDimension === "both" ? "width and height attributes" : `${missingDimension} attribute`} for ${imageURL}. When using remote images, both dimensions are required in order to avoid CLS.`,
  hint: "If your image is inside your `src` folder, you probably meant to import it instead. See [the Imports guide for more information](https://docs.astro.build/en/guides/imports/#other-assets). You can also use `inferSize={true}` for remote images to get the original dimensions."
};
const FailedToFetchRemoteImageDimensions = {
  name: "FailedToFetchRemoteImageDimensions",
  title: "Failed to retrieve remote image dimensions.",
  message: (imageURL) => `Failed to get the dimensions for ${imageURL}.`,
  hint: "Verify your remote image URL is accurate, and that you are not using `inferSize` with a file located in your `public/` folder."
};
const RemoteImageNotAllowed = {
  name: "RemoteImageNotAllowed",
  title: "Remote image is not allowed.",
  message: (imageURL) => `Remote image ${imageURL} is not allowed by your image configuration.`,
  hint: "Update `image.domains` or `image.remotePatterns`, or remove `inferSize` for this image."
};
const UnsupportedImageFormat = {
  name: "UnsupportedImageFormat",
  title: "Unsupported image format.",
  message: (format, imagePath, supportedFormats) => `Received unsupported format \`${format}\` from \`${imagePath}\`. Currently only ${supportedFormats.join(
    ", "
  )} are supported by our image services.`,
  hint: "Using an `img` tag directly instead of the `Image` component might be what you're looking for."
};
const UnsupportedImageConversion = {
  name: "UnsupportedImageConversion",
  title: "Unsupported image conversion.",
  message: "Converting between vector (such as SVGs) and raster (such as PNGs and JPEGs) images is not currently supported."
};
const PrerenderDynamicEndpointPathCollide = {
  name: "PrerenderDynamicEndpointPathCollide",
  title: "Prerendered dynamic endpoint has path collision.",
  message: (pathname) => `Could not render \`${pathname}\` with an \`undefined\` param as the generated path will collide during prerendering. Prevent passing \`undefined\` as \`params\` for the endpoint's \`getStaticPaths()\` function, or add an additional extension to the endpoint's filename.`,
  hint: (filename) => `Rename \`${filename}\` to \`${filename.replace(/\.(?:js|ts)/, (m) => `.json` + m)}\``
};
const ExpectedImage = {
  name: "ExpectedImage",
  title: "Expected src to be an image.",
  message: (src, typeofOptions, fullOptions) => `Expected \`src\` property for \`getImage\` or \`<Image />\` to be either an ESM imported image or a string with the path of a remote image. Received \`${src}\` (type: \`${typeofOptions}\`).

Full serialized options received: \`${fullOptions}\`.`,
  hint: "This error can often happen because of a wrong path. Make sure the path to your image is correct. If you're passing an async function, make sure to call and await it."
};
const ExpectedImageOptions = {
  name: "ExpectedImageOptions",
  title: "Expected image options.",
  message: (options) => `Expected \`getImage()\` parameter to be an object. Received \`${options}\`.`
};
const ExpectedNotESMImage = {
  name: "ExpectedNotESMImage",
  title: "Expected image options, not an ESM-imported image.",
  message: "An ESM-imported image cannot be passed directly to `getImage()`. Instead, pass an object with the image in the `src` property.",
  hint: "Try changing `getImage(myImage)` to `getImage({ src: myImage })`"
};
const IncompatibleDescriptorOptions = {
  name: "IncompatibleDescriptorOptions",
  title: "Cannot set both `densities` and `widths`.",
  message: "Only one of `densities` or `widths` can be specified. In most cases, you'll probably want to use only `widths` if you require specific widths.",
  hint: "Those attributes are used to construct a `srcset` attribute, which cannot have both `x` and `w` descriptors."
};
const NoImageMetadata = {
  name: "NoImageMetadata",
  title: "Could not process image metadata.",
  message: (imagePath) => `Could not process image metadata${imagePath ? ` for \`${imagePath}\`` : ""}.`,
  hint: "This is often caused by a corrupted or malformed image. Re-exporting the image from your image editor may fix this issue."
};
const ResponseSentError = {
  name: "ResponseSentError",
  title: "Unable to set response.",
  message: "The response has already been sent to the browser and cannot be altered."
};
const MiddlewareNoDataOrNextCalled = {
  name: "MiddlewareNoDataOrNextCalled",
  title: "The middleware didn't return a `Response`.",
  message: "Make sure your middleware returns a `Response` object, either directly or by returning the `Response` from calling the `next` function."
};
const MiddlewareNotAResponse = {
  name: "MiddlewareNotAResponse",
  title: "The middleware returned something that is not a `Response` object.",
  message: "Any data returned from middleware must be a valid `Response` object."
};
const EndpointDidNotReturnAResponse = {
  name: "EndpointDidNotReturnAResponse",
  title: "The endpoint did not return a `Response`.",
  message: "An endpoint must return either a `Response`, or a `Promise` that resolves with a `Response`."
};
const LocalsNotAnObject = {
  name: "LocalsNotAnObject",
  title: "Value assigned to `locals` is not accepted.",
  message: "`locals` can only be assigned to an object. Other values like numbers, strings, etc. are not accepted.",
  hint: "If you tried to remove some information from the `locals` object, try to use `delete` or set the property to `undefined`."
};
const LocalsReassigned = {
  name: "LocalsReassigned",
  title: "`locals` must not be reassigned.",
  message: "`locals` cannot be assigned directly.",
  hint: "Set a `locals` property instead."
};
const AstroResponseHeadersReassigned = {
  name: "AstroResponseHeadersReassigned",
  title: "`Astro.response.headers` must not be reassigned.",
  message: "Individual headers can be added to and removed from `Astro.response.headers`, but it must not be replaced with another instance of `Headers` altogether.",
  hint: "Consider using `Astro.response.headers.add()`, and `Astro.response.headers.delete()`."
};
const LocalImageUsedWrongly = {
  name: "LocalImageUsedWrongly",
  title: "Local images must be imported.",
  message: (imageFilePath) => `\`Image\`'s and \`getImage\`'s \`src\` parameter must be an imported image or a URL, it cannot be a string filepath. Received \`${imageFilePath}\`.`,
  hint: "If you want to use an image from your `src` folder, you need to either import it or if the image is coming from a content collection, use the [image() schema helper](https://docs.astro.build/en/guides/images/#images-in-content-collections). See https://docs.astro.build/en/reference/modules/astro-assets/#src-required for more information on the `src` property."
};
const MissingSharp = {
  name: "MissingSharp",
  title: "Could not find Sharp.",
  message: "Could not find Sharp. Please install Sharp (`sharp`) manually into your project or migrate to another image service.",
  hint: "See Sharp's installation instructions for more information: https://sharp.pixelplumbing.com/install. If you are not relying on `astro:assets` to optimize, transform, or process any images, you can configure a passthrough image service instead of installing Sharp. See https://docs.astro.build/en/reference/errors/missing-sharp for more information.\n\nSee https://docs.astro.build/en/guides/images/#default-image-service for more information on how to migrate to another image service."
};
const i18nNoLocaleFoundInPath = {
  name: "i18nNoLocaleFoundInPath",
  title: "The path doesn't contain any locale.",
  message: "You tried to use an i18n utility on a path that doesn't contain any locale. You can use `pathHasLocale` first to determine if the path has a locale."
};
const RewriteWithBodyUsed = {
  name: "RewriteWithBodyUsed",
  title: "Cannot use `Astro.rewrite()` after the request body has been read.",
  message: "`Astro.rewrite()` cannot be used if the request body has already been read. If you need to read the body, first clone the request."
};
const ForbiddenRewrite = {
  name: "ForbiddenRewrite",
  title: "Forbidden rewrite to a static route.",
  message: (from, to, component) => `You tried to rewrite the on-demand route '${from}' with the static route '${to}', when using the 'server' output. 

The static route '${to}' is rendered by the component
'${component}', which is marked as prerendered. This is a forbidden operation because during the build, the component '${component}' is compiled to an
HTML file, which can't be retrieved at runtime by Astro.`,
  hint: (component) => `Add \`export const prerender = false\` to the component '${component}', or use \`Astro.redirect()\`.`
};
const FontFamilyNotFound = {
  name: "FontFamilyNotFound",
  title: "Font family not found.",
  message: (family) => `No data was found for the \`"${family}"\` family passed to the \`<Font>\` component.`,
  hint: "This is often caused by a typo. Check that the `<Font />` component is using a `cssVariable` specified in your config."
};
const MissingGetFontFileRequestUrl = {
  name: "MissingGetFontFileRequestUrl",
  title: "`experimental_getFontFileURL()` requires the request URL with on-demand rendering.",
  hint: "Pass the request URL as the 2nd argument, for example `Astro.url`."
};
const UnableToLoadLogger = {
  name: "UnableToLoadLogger",
  title: "Unable to load the logger.",
  message: (path) => `Couldn't load the logger at given path "${path}".`
};
const ActionsReturnedInvalidDataError = {
  name: "ActionsReturnedInvalidDataError",
  title: "Action handler returned invalid data.",
  message: (error) => `Action handler returned invalid data. Handlers should return serializable data types like objects, arrays, strings, and numbers. Parse error: ${error}`,
  hint: "See the devalue library for all supported types: https://github.com/rich-harris/devalue"
};
const ActionNotFoundError = {
  name: "ActionNotFoundError",
  title: "Action not found.",
  message: (actionName) => `The server received a request for an action named \`${actionName}\` but could not find a match. If you renamed an action, check that you've updated your \`actions/index\` file and your calling code to match.`,
  hint: "You can run `astro check` to detect type errors caused by mismatched action names."
};
const SessionStorageInitError = {
  name: "SessionStorageInitError",
  title: "Session storage could not be initialized.",
  message: (error, driver) => `Error when initializing session storage${driver ? ` with driver \`${driver}\`` : ""}. \`${error ?? ""}\``,
  hint: "For more information, see https://docs.astro.build/en/guides/sessions/"
};
const SessionStorageSaveError = {
  name: "SessionStorageSaveError",
  title: "Session data could not be saved.",
  message: (error, driver) => `Error when saving session data${driver ? ` with driver \`${driver}\`` : ""}. \`${error ?? ""}\``,
  hint: "For more information, see https://docs.astro.build/en/guides/sessions/"
};
const CacheNotEnabled = {
  name: "CacheNotEnabled",
  title: "Cache is not enabled.",
  message: "`Astro.cache` is not available because the cache feature is not enabled. To use caching, configure a cache provider in your Astro config under `experimental.cache`.",
  hint: 'Use an adapter that provides a default cache provider, or set one explicitly: `experimental: { cache: { provider: "..." } }`. See https://docs.astro.build/en/reference/experimental-flags/route-caching/.'
};

function matchPattern(url, remotePattern) {
  return matchProtocol(url, remotePattern.protocol) && matchHostname(url, remotePattern.hostname, true) && matchPort(url, remotePattern.port) && matchPathname(url, remotePattern.pathname, true);
}
function matchPort(url, port) {
  return !port || port === url.port;
}
function matchProtocol(url, protocol) {
  return !protocol || protocol === url.protocol.slice(0, -1);
}
function matchHostname(url, hostname, allowWildcard = false) {
  if (!hostname) {
    return true;
  } else if (!allowWildcard || !hostname.startsWith("*")) {
    return hostname === url.hostname;
  } else if (hostname.startsWith("**.")) {
    const slicedHostname = hostname.slice(2);
    return slicedHostname !== url.hostname && url.hostname.endsWith(slicedHostname);
  } else if (hostname.startsWith("*.")) {
    const slicedHostname = hostname.slice(1);
    if (!url.hostname.endsWith(slicedHostname)) {
      return false;
    }
    const subdomainWithDot = url.hostname.slice(0, -(slicedHostname.length - 1));
    return subdomainWithDot.endsWith(".") && !subdomainWithDot.slice(0, -1).includes(".");
  }
  return false;
}
function matchPathname(url, pathname, allowWildcard = false) {
  if (!pathname) {
    return true;
  } else if (!allowWildcard || !pathname.endsWith("*")) {
    return pathname === url.pathname;
  } else if (pathname.endsWith("/**")) {
    const slicedPathname = pathname.slice(0, -2);
    return slicedPathname !== url.pathname && url.pathname.startsWith(slicedPathname);
  } else if (pathname.endsWith("/*")) {
    const slicedPathname = pathname.slice(0, -1);
    if (!url.pathname.startsWith(slicedPathname)) {
      return false;
    }
    const additionalPathChunks = url.pathname.slice(slicedPathname.length).split("/").filter(Boolean);
    return additionalPathChunks.length === 1;
  }
  return false;
}
function isRemoteAllowed(src, {
  domains,
  remotePatterns
}) {
  if (!URL.canParse(src)) {
    return false;
  }
  const url = new URL(src);
  if (!["http:", "https:", "data:"].includes(url.protocol)) {
    return false;
  }
  return domains.some((domain) => matchHostname(url, domain)) || remotePatterns.some((remotePattern) => matchPattern(url, remotePattern));
}

const decoder$2 = new TextDecoder();
const toUTF8String = (input, start = 0, end = input.length) => decoder$2.decode(input.slice(start, end));
const toHexString = (input, start = 0, end = input.length) => input.slice(start, end).reduce((memo, i) => memo + `0${i.toString(16)}`.slice(-2), "");
const getView = (input, offset) => new DataView(input.buffer, input.byteOffset + offset);
const readInt16LE = (input, offset = 0) => getView(input, offset).getInt16(0, true);
const readUInt16BE = (input, offset = 0) => getView(input, offset).getUint16(0, false);
const readUInt16LE = (input, offset = 0) => getView(input, offset).getUint16(0, true);
const readUInt24LE = (input, offset = 0) => {
  const view = getView(input, offset);
  return view.getUint16(0, true) + (view.getUint8(2) << 16);
};
const readInt32LE = (input, offset = 0) => getView(input, offset).getInt32(0, true);
const readUInt32BE = (input, offset = 0) => getView(input, offset).getUint32(0, false);
const readUInt32LE = (input, offset = 0) => getView(input, offset).getUint32(0, true);
const readUInt64 = (input, offset, isBigEndian) => getView(input, offset).getBigUint64(0, !isBigEndian);
const methods = {
  readUInt16BE,
  readUInt16LE,
  readUInt32BE,
  readUInt32LE
};
function readUInt(input, bits, offset = 0, isBigEndian = false) {
  const endian = isBigEndian ? "BE" : "LE";
  const methodName = `readUInt${bits}${endian}`;
  return methods[methodName](input, offset);
}
function readBox(input, offset) {
  if (input.length - offset < 4) return;
  const boxSize = readUInt32BE(input, offset);
  if (input.length - offset < boxSize) return;
  return {
    name: toUTF8String(input, 4 + offset, 8 + offset),
    offset,
    size: boxSize
  };
}
function findBox(input, boxName, currentOffset) {
  while (currentOffset < input.length) {
    const box = readBox(input, currentOffset);
    if (!box) break;
    if (box.name === boxName) return box;
    currentOffset += box.size > 0 ? box.size : 8;
  }
}

const BMP = {
  validate: (input) => toUTF8String(input, 0, 2) === "BM",
  calculate: (input) => ({
    height: Math.abs(readInt32LE(input, 22)),
    width: readUInt32LE(input, 18)
  })
};

const TYPE_ICON = 1;
const SIZE_HEADER$1 = 2 + 2 + 2;
const SIZE_IMAGE_ENTRY = 1 + 1 + 1 + 1 + 2 + 2 + 4 + 4;
function getSizeFromOffset(input, offset) {
  const value = input[offset];
  return value === 0 ? 256 : value;
}
function getImageSize$1(input, imageIndex) {
  const offset = SIZE_HEADER$1 + imageIndex * SIZE_IMAGE_ENTRY;
  return {
    height: getSizeFromOffset(input, offset + 1),
    width: getSizeFromOffset(input, offset)
  };
}
const ICO = {
  validate(input) {
    const reserved = readUInt16LE(input, 0);
    const imageCount = readUInt16LE(input, 4);
    if (reserved !== 0 || imageCount === 0) return false;
    const imageType = readUInt16LE(input, 2);
    return imageType === TYPE_ICON;
  },
  calculate(input) {
    const nbImages = readUInt16LE(input, 4);
    const imageSize = getImageSize$1(input, 0);
    if (nbImages === 1) return imageSize;
    const images = [];
    for (let imageIndex = 0; imageIndex < nbImages; imageIndex += 1) {
      images.push(getImageSize$1(input, imageIndex));
    }
    return {
      width: imageSize.width,
      height: imageSize.height,
      images
    };
  }
};

const TYPE_CURSOR = 2;
const CUR = {
  validate(input) {
    const reserved = readUInt16LE(input, 0);
    const imageCount = readUInt16LE(input, 4);
    if (reserved !== 0 || imageCount === 0) return false;
    const imageType = readUInt16LE(input, 2);
    return imageType === TYPE_CURSOR;
  },
  calculate: (input) => ICO.calculate(input)
};

const DDS = {
  validate: (input) => readUInt32LE(input, 0) === 542327876,
  calculate: (input) => ({
    height: readUInt32LE(input, 12),
    width: readUInt32LE(input, 16)
  })
};

const gifRegexp = /^GIF8[79]a/;
const GIF = {
  validate: (input) => gifRegexp.test(toUTF8String(input, 0, 6)),
  calculate: (input) => ({
    height: readUInt16LE(input, 8),
    width: readUInt16LE(input, 6)
  })
};

const brandMap = {
  avif: "avif",
  avis: "avif",
  // avif-sequence
  mif1: "heif",
  msf1: "heif",
  // heif-sequence
  heic: "heic",
  heix: "heic",
  hevc: "heic",
  // heic-sequence
  hevx: "heic"
  // heic-sequence
};
function detectType(input, start, end) {
  let hasAvif = false;
  let hasHeic = false;
  let hasHeif = false;
  for (let i = start; i <= end; i += 4) {
    const brand = toUTF8String(input, i, i + 4);
    if (brand === "avif" || brand === "avis") hasAvif = true;
    else if (brand === "heic" || brand === "heix" || brand === "hevc" || brand === "hevx") hasHeic = true;
    else if (brand === "mif1" || brand === "msf1") hasHeif = true;
  }
  if (hasAvif) return "avif";
  if (hasHeic) return "heic";
  if (hasHeif) return "heif";
}
const HEIF = {
  validate(input) {
    const boxType = toUTF8String(input, 4, 8);
    if (boxType !== "ftyp") return false;
    const ftypBox = findBox(input, "ftyp", 0);
    if (!ftypBox) return false;
    const brand = toUTF8String(input, ftypBox.offset + 8, ftypBox.offset + 12);
    return brand in brandMap;
  },
  calculate(input) {
    const metaBox = findBox(input, "meta", 0);
    const iprpBox = metaBox && findBox(input, "iprp", metaBox.offset + 12);
    const ipcoBox = iprpBox && findBox(input, "ipco", iprpBox.offset + 8);
    if (!ipcoBox) {
      throw new TypeError("Invalid HEIF, no ipco box found");
    }
    const type = detectType(input, 8, metaBox.offset);
    const images = [];
    let currentOffset = ipcoBox.offset + 8;
    while (currentOffset < ipcoBox.offset + ipcoBox.size) {
      const ispeBox = findBox(input, "ispe", currentOffset);
      if (!ispeBox) break;
      const rawWidth = readUInt32BE(input, ispeBox.offset + 12);
      const rawHeight = readUInt32BE(input, ispeBox.offset + 16);
      const clapBox = findBox(input, "clap", currentOffset);
      let width = rawWidth;
      let height = rawHeight;
      if (clapBox && clapBox.offset < ipcoBox.offset + ipcoBox.size) {
        const cropRight = readUInt32BE(input, clapBox.offset + 12);
        width = rawWidth - cropRight;
      }
      images.push({ height, width });
      currentOffset = ispeBox.offset + ispeBox.size;
    }
    if (images.length === 0) {
      throw new TypeError("Invalid HEIF, no sizes found");
    }
    return {
      width: images[0].width,
      height: images[0].height,
      type,
      ...images.length > 1 ? { images } : {}
    };
  }
};

const SIZE_HEADER = 4 + 4;
const FILE_LENGTH_OFFSET = 4;
const ENTRY_LENGTH_OFFSET = 4;
const ICON_TYPE_SIZE = {
  ICON: 32,
  "ICN#": 32,
  // m => 16 x 16
  "icm#": 16,
  icm4: 16,
  icm8: 16,
  // s => 16 x 16
  "ics#": 16,
  ics4: 16,
  ics8: 16,
  is32: 16,
  s8mk: 16,
  icp4: 16,
  // l => 32 x 32
  icl4: 32,
  icl8: 32,
  il32: 32,
  l8mk: 32,
  icp5: 32,
  ic11: 32,
  // h => 48 x 48
  ich4: 48,
  ich8: 48,
  ih32: 48,
  h8mk: 48,
  // . => 64 x 64
  icp6: 64,
  ic12: 32,
  // t => 128 x 128
  it32: 128,
  t8mk: 128,
  ic07: 128,
  // . => 256 x 256
  ic08: 256,
  ic13: 256,
  // . => 512 x 512
  ic09: 512,
  ic14: 512,
  // . => 1024 x 1024
  ic10: 1024
};
function readImageHeader(input, imageOffset) {
  const imageLengthOffset = imageOffset + ENTRY_LENGTH_OFFSET;
  return [
    toUTF8String(input, imageOffset, imageLengthOffset),
    readUInt32BE(input, imageLengthOffset)
  ];
}
function getImageSize(type) {
  const size = ICON_TYPE_SIZE[type];
  return { width: size, height: size, type };
}
const ICNS = {
  validate: (input) => toUTF8String(input, 0, 4) === "icns",
  calculate(input) {
    const inputLength = input.length;
    const fileLength = readUInt32BE(input, FILE_LENGTH_OFFSET);
    let imageOffset = SIZE_HEADER;
    const images = [];
    while (imageOffset < fileLength && imageOffset < inputLength) {
      const imageHeader = readImageHeader(input, imageOffset);
      const imageSize = getImageSize(imageHeader[0]);
      images.push(imageSize);
      imageOffset += imageHeader[1];
    }
    if (images.length === 0) {
      throw new TypeError("Invalid ICNS, no sizes found");
    }
    return {
      width: images[0].width,
      height: images[0].height,
      ...images.length > 1 ? { images } : {}
    };
  }
};

const J2C = {
  // TODO: this doesn't seem right. SIZ marker doesn't have to be right after the SOC
  validate: (input) => readUInt32BE(input, 0) === 4283432785,
  calculate: (input) => ({
    height: readUInt32BE(input, 12),
    width: readUInt32BE(input, 8)
  })
};

const JP2 = {
  validate(input) {
    const boxType = toUTF8String(input, 4, 8);
    if (boxType !== "jP  ") return false;
    const ftypBox = findBox(input, "ftyp", 0);
    if (!ftypBox) return false;
    const brand = toUTF8String(input, ftypBox.offset + 8, ftypBox.offset + 12);
    return brand === "jp2 ";
  },
  calculate(input) {
    const jp2hBox = findBox(input, "jp2h", 0);
    const ihdrBox = jp2hBox && findBox(input, "ihdr", jp2hBox.offset + 8);
    if (ihdrBox) {
      return {
        height: readUInt32BE(input, ihdrBox.offset + 8),
        width: readUInt32BE(input, ihdrBox.offset + 12)
      };
    }
    throw new TypeError("Unsupported JPEG 2000 format");
  }
};

const EXIF_MARKER = "45786966";
const APP1_DATA_SIZE_BYTES = 2;
const EXIF_HEADER_BYTES = 6;
const TIFF_BYTE_ALIGN_BYTES = 2;
const BIG_ENDIAN_BYTE_ALIGN = "4d4d";
const LITTLE_ENDIAN_BYTE_ALIGN = "4949";
const IDF_ENTRY_BYTES = 12;
const NUM_DIRECTORY_ENTRIES_BYTES = 2;
function isEXIF(input) {
  return toHexString(input, 2, 6) === EXIF_MARKER;
}
function extractSize(input, index) {
  return {
    height: readUInt16BE(input, index),
    width: readUInt16BE(input, index + 2)
  };
}
function extractOrientation(exifBlock, isBigEndian) {
  const idfOffset = 8;
  const offset = EXIF_HEADER_BYTES + idfOffset;
  const idfDirectoryEntries = readUInt(exifBlock, 16, offset, isBigEndian);
  for (let directoryEntryNumber = 0; directoryEntryNumber < idfDirectoryEntries; directoryEntryNumber++) {
    const start = offset + NUM_DIRECTORY_ENTRIES_BYTES + directoryEntryNumber * IDF_ENTRY_BYTES;
    const end = start + IDF_ENTRY_BYTES;
    if (start > exifBlock.length) {
      return;
    }
    const block = exifBlock.slice(start, end);
    const tagNumber = readUInt(block, 16, 0, isBigEndian);
    if (tagNumber === 274) {
      const dataFormat = readUInt(block, 16, 2, isBigEndian);
      if (dataFormat !== 3) {
        return;
      }
      const numberOfComponents = readUInt(block, 32, 4, isBigEndian);
      if (numberOfComponents !== 1) {
        return;
      }
      return readUInt(block, 16, 8, isBigEndian);
    }
  }
}
function validateExifBlock(input, index) {
  const exifBlock = input.slice(APP1_DATA_SIZE_BYTES, index);
  const byteAlign = toHexString(
    exifBlock,
    EXIF_HEADER_BYTES,
    EXIF_HEADER_BYTES + TIFF_BYTE_ALIGN_BYTES
  );
  const isBigEndian = byteAlign === BIG_ENDIAN_BYTE_ALIGN;
  const isLittleEndian = byteAlign === LITTLE_ENDIAN_BYTE_ALIGN;
  if (isBigEndian || isLittleEndian) {
    return extractOrientation(exifBlock, isBigEndian);
  }
}
function validateInput(input, index) {
  if (index > input.length) {
    throw new TypeError("Corrupt JPG, exceeded buffer limits");
  }
}
const JPG = {
  validate: (input) => toHexString(input, 0, 2) === "ffd8",
  calculate(_input) {
    let input = _input.slice(4);
    let orientation;
    let next;
    while (input.length) {
      const i = readUInt16BE(input, 0);
      validateInput(input, i);
      if (input[i] !== 255) {
        input = input.slice(1);
        continue;
      }
      if (isEXIF(input)) {
        orientation = validateExifBlock(input, i);
      }
      next = input[i + 1];
      if (next === 192 || next === 193 || next === 194) {
        const size = extractSize(input, i + 5);
        if (!orientation) {
          return size;
        }
        return {
          height: size.height,
          orientation,
          width: size.width
        };
      }
      input = input.slice(i + 2);
    }
    throw new TypeError("Invalid JPG, no size found");
  }
};

class BitReader {
  // Skip the first 16 bits (2 bytes) of signature
  byteOffset = 2;
  bitOffset = 0;
  input;
  endianness;
  constructor(input, endianness) {
    this.input = input;
    this.endianness = endianness;
  }
  /** Reads a specified number of bits, and move the offset */
  getBits(length = 1) {
    let result = 0;
    let bitsRead = 0;
    while (bitsRead < length) {
      if (this.byteOffset >= this.input.length) {
        throw new Error("Reached end of input");
      }
      const currentByte = this.input[this.byteOffset];
      const bitsLeft = 8 - this.bitOffset;
      const bitsToRead = Math.min(length - bitsRead, bitsLeft);
      if (this.endianness === "little-endian") {
        const mask = (1 << bitsToRead) - 1;
        const bits = currentByte >> this.bitOffset & mask;
        result |= bits << bitsRead;
      } else {
        const mask = (1 << bitsToRead) - 1 << 8 - this.bitOffset - bitsToRead;
        const bits = (currentByte & mask) >> 8 - this.bitOffset - bitsToRead;
        result = result << bitsToRead | bits;
      }
      bitsRead += bitsToRead;
      this.bitOffset += bitsToRead;
      if (this.bitOffset === 8) {
        this.byteOffset++;
        this.bitOffset = 0;
      }
    }
    return result;
  }
}

function calculateImageDimension(reader, isSmallImage) {
  if (isSmallImage) {
    return 8 * (1 + reader.getBits(5));
  }
  const sizeClass = reader.getBits(2);
  const extraBits = [9, 13, 18, 30][sizeClass];
  return 1 + reader.getBits(extraBits);
}
function calculateImageWidth(reader, isSmallImage, widthMode, height) {
  if (isSmallImage && widthMode === 0) {
    return 8 * (1 + reader.getBits(5));
  }
  if (widthMode === 0) {
    return calculateImageDimension(reader, false);
  }
  const aspectRatios = [1, 1.2, 4 / 3, 1.5, 16 / 9, 5 / 4, 2];
  return Math.floor(height * aspectRatios[widthMode - 1]);
}
const JXLStream = {
  validate: (input) => {
    return toHexString(input, 0, 2) === "ff0a";
  },
  calculate(input) {
    const reader = new BitReader(input, "little-endian");
    const isSmallImage = reader.getBits(1) === 1;
    const height = calculateImageDimension(reader, isSmallImage);
    const widthMode = reader.getBits(3);
    const width = calculateImageWidth(reader, isSmallImage, widthMode, height);
    return { width, height };
  }
};

function extractCodestream(input) {
  const jxlcBox = findBox(input, "jxlc", 0);
  if (jxlcBox) {
    return input.slice(jxlcBox.offset + 8, jxlcBox.offset + jxlcBox.size);
  }
  const partialStreams = extractPartialStreams(input);
  if (partialStreams.length > 0) {
    return concatenateCodestreams(partialStreams);
  }
  return void 0;
}
function extractPartialStreams(input) {
  const partialStreams = [];
  let offset = 0;
  while (offset < input.length) {
    const jxlpBox = findBox(input, "jxlp", offset);
    if (!jxlpBox) break;
    partialStreams.push(
      input.slice(jxlpBox.offset + 12, jxlpBox.offset + jxlpBox.size)
    );
    offset = jxlpBox.offset + jxlpBox.size;
  }
  return partialStreams;
}
function concatenateCodestreams(partialCodestreams) {
  const totalLength = partialCodestreams.reduce(
    (acc, curr) => acc + curr.length,
    0
  );
  const codestream = new Uint8Array(totalLength);
  let position = 0;
  for (const partial of partialCodestreams) {
    codestream.set(partial, position);
    position += partial.length;
  }
  return codestream;
}
const JXL = {
  validate: (input) => {
    const boxType = toUTF8String(input, 4, 8);
    if (boxType !== "JXL ") return false;
    const ftypBox = findBox(input, "ftyp", 0);
    if (!ftypBox) return false;
    const brand = toUTF8String(input, ftypBox.offset + 8, ftypBox.offset + 12);
    return brand === "jxl ";
  },
  calculate(input) {
    const codestream = extractCodestream(input);
    if (codestream) return JXLStream.calculate(codestream);
    throw new Error("No codestream found in JXL container");
  }
};

const KTX = {
  validate: (input) => {
    const signature = toUTF8String(input, 1, 7);
    return ["KTX 11", "KTX 20"].includes(signature);
  },
  calculate: (input) => {
    const type = input[5] === 49 ? "ktx" : "ktx2";
    const offset = type === "ktx" ? 36 : 20;
    return {
      height: readUInt32LE(input, offset + 4),
      width: readUInt32LE(input, offset),
      type
    };
  }
};

const pngSignature = "PNG\r\n\n";
const pngImageHeaderChunkName = "IHDR";
const pngFriedChunkName = "CgBI";
const PNG = {
  validate(input) {
    if (pngSignature === toUTF8String(input, 1, 8)) {
      let chunkName = toUTF8String(input, 12, 16);
      if (chunkName === pngFriedChunkName) {
        chunkName = toUTF8String(input, 28, 32);
      }
      if (chunkName !== pngImageHeaderChunkName) {
        throw new TypeError("Invalid PNG");
      }
      return true;
    }
    return false;
  },
  calculate(input) {
    if (toUTF8String(input, 12, 16) === pngFriedChunkName) {
      return {
        height: readUInt32BE(input, 36),
        width: readUInt32BE(input, 32)
      };
    }
    return {
      height: readUInt32BE(input, 20),
      width: readUInt32BE(input, 16)
    };
  }
};

const PNMTypes = {
  P1: "pbm/ascii",
  P2: "pgm/ascii",
  P3: "ppm/ascii",
  P4: "pbm",
  P5: "pgm",
  P6: "ppm",
  P7: "pam",
  PF: "pfm"
};
const handlers = {
  default: (lines) => {
    let dimensions = [];
    while (lines.length > 0) {
      const line = lines.shift();
      if (line[0] === "#") {
        continue;
      }
      dimensions = line.split(" ");
      break;
    }
    if (dimensions.length === 2) {
      return {
        height: Number.parseInt(dimensions[1], 10),
        width: Number.parseInt(dimensions[0], 10)
      };
    }
    throw new TypeError("Invalid PNM");
  },
  pam: (lines) => {
    const size = {};
    while (lines.length > 0) {
      const line = lines.shift();
      if (line.length > 16 || line.charCodeAt(0) > 128) {
        continue;
      }
      const [key, value] = line.split(" ");
      if (key && value) {
        size[key.toLowerCase()] = Number.parseInt(value, 10);
      }
      if (size.height && size.width) {
        break;
      }
    }
    if (size.height && size.width) {
      return {
        height: size.height,
        width: size.width
      };
    }
    throw new TypeError("Invalid PAM");
  }
};
const PNM = {
  validate: (input) => toUTF8String(input, 0, 2) in PNMTypes,
  calculate(input) {
    const signature = toUTF8String(input, 0, 2);
    const type = PNMTypes[signature];
    const lines = toUTF8String(input, 3).split(/[\r\n]+/);
    const handler = handlers[type] || handlers.default;
    return handler(lines);
  }
};

const PSD = {
  validate: (input) => toUTF8String(input, 0, 4) === "8BPS",
  calculate: (input) => ({
    height: readUInt32BE(input, 14),
    width: readUInt32BE(input, 18)
  })
};

const svgReg = /<svg\s([^>"']|"[^"]*"|'[^']*')*>/;
const extractorRegExps = {
  height: /\sheight=(['"])([^%]+?)\1/,
  root: svgReg,
  viewbox: /\sviewBox=(['"])(.+?)\1/i,
  width: /\swidth=(['"])([^%]+?)\1/
};
const INCH_CM = 2.54;
const units = {
  in: 96,
  cm: 96 / INCH_CM,
  em: 16,
  ex: 8,
  m: 96 / INCH_CM * 100,
  mm: 96 / INCH_CM / 10,
  pc: 96 / 72 / 12,
  pt: 96 / 72,
  px: 1
};
const unitsReg = new RegExp(
  `^([0-9.]+(?:e\\d+)?)(${Object.keys(units).join("|")})?$`
);
function parseLength(len) {
  const m = unitsReg.exec(len);
  if (!m) {
    return void 0;
  }
  return Math.round(Number(m[1]) * (units[m[2]] || 1));
}
function parseViewbox(viewbox) {
  const bounds = viewbox.split(" ");
  return {
    height: parseLength(bounds[3]),
    width: parseLength(bounds[2])
  };
}
function parseAttributes(root) {
  const width = extractorRegExps.width.exec(root);
  const height = extractorRegExps.height.exec(root);
  const viewbox = extractorRegExps.viewbox.exec(root);
  return {
    height: height && parseLength(height[2]),
    viewbox: viewbox && parseViewbox(viewbox[2]),
    width: width && parseLength(width[2])
  };
}
function calculateByDimensions(attrs) {
  return {
    height: attrs.height,
    width: attrs.width
  };
}
function calculateByViewbox(attrs, viewbox) {
  const ratio = viewbox.width / viewbox.height;
  if (attrs.width) {
    return {
      height: Math.floor(attrs.width / ratio),
      width: attrs.width
    };
  }
  if (attrs.height) {
    return {
      height: attrs.height,
      width: Math.floor(attrs.height * ratio)
    };
  }
  return {
    height: viewbox.height,
    width: viewbox.width
  };
}
const SVG = {
  // Scan only the first kilo-byte to speed up the check on larger files
  validate: (input) => svgReg.test(toUTF8String(input, 0, 1e3)),
  calculate(input) {
    const root = extractorRegExps.root.exec(toUTF8String(input));
    if (root) {
      const attrs = parseAttributes(root[0]);
      if (attrs.width != null && attrs.height != null) {
        return calculateByDimensions(attrs);
      }
      if (attrs.viewbox) {
        return calculateByViewbox(attrs, attrs.viewbox);
      }
    }
    throw new TypeError("Invalid SVG");
  }
};

const TGA = {
  validate(input) {
    return readUInt16LE(input, 0) === 0 && readUInt16LE(input, 4) === 0;
  },
  calculate(input) {
    return {
      height: readUInt16LE(input, 14),
      width: readUInt16LE(input, 12)
    };
  }
};

const CONSTANTS = {
  TAG: {
    WIDTH: 256,
    HEIGHT: 257,
    COMPRESSION: 259
  },
  TYPE: {
    SHORT: 3,
    LONG: 4,
    LONG8: 16
  },
  ENTRY_SIZE: {
    STANDARD: 12,
    BIG: 20
  },
  COUNT_SIZE: {
    STANDARD: 2,
    BIG: 8
  }
};
function readIFD(input, { isBigEndian, isBigTiff }) {
  const ifdOffset = isBigTiff ? Number(readUInt64(input, 8, isBigEndian)) : readUInt(input, 32, 4, isBigEndian);
  const entryCountSize = isBigTiff ? CONSTANTS.COUNT_SIZE.BIG : CONSTANTS.COUNT_SIZE.STANDARD;
  return input.slice(ifdOffset + entryCountSize);
}
function readTagValue(input, type, offset, isBigEndian) {
  switch (type) {
    case CONSTANTS.TYPE.SHORT:
      return readUInt(input, 16, offset, isBigEndian);
    case CONSTANTS.TYPE.LONG:
      return readUInt(input, 32, offset, isBigEndian);
    case CONSTANTS.TYPE.LONG8: {
      const value = Number(readUInt64(input, offset, isBigEndian));
      if (value > Number.MAX_SAFE_INTEGER) {
        throw new TypeError("Value too large");
      }
      return value;
    }
    default:
      return 0;
  }
}
function nextTag(input, isBigTiff) {
  const entrySize = isBigTiff ? CONSTANTS.ENTRY_SIZE.BIG : CONSTANTS.ENTRY_SIZE.STANDARD;
  if (input.length > entrySize) {
    return input.slice(entrySize);
  }
}
function extractTags(input, { isBigEndian, isBigTiff }) {
  const tags = {};
  let temp = input;
  while (temp?.length) {
    const code = readUInt(temp, 16, 0, isBigEndian);
    const type = readUInt(temp, 16, 2, isBigEndian);
    const length = isBigTiff ? Number(readUInt64(temp, 4, isBigEndian)) : readUInt(temp, 32, 4, isBigEndian);
    if (code === 0) break;
    if (length === 1 && (type === CONSTANTS.TYPE.SHORT || type === CONSTANTS.TYPE.LONG || isBigTiff && type === CONSTANTS.TYPE.LONG8)) {
      const valueOffset = isBigTiff ? 12 : 8;
      tags[code] = readTagValue(temp, type, valueOffset, isBigEndian);
    }
    temp = nextTag(temp, isBigTiff);
  }
  return tags;
}
function determineFormat(input) {
  const signature = toUTF8String(input, 0, 2);
  const version = readUInt(input, 16, 2, signature === "MM");
  return {
    isBigEndian: signature === "MM",
    isBigTiff: version === 43
  };
}
function validateBigTIFFHeader(input, isBigEndian) {
  const byteSize = readUInt(input, 16, 4, isBigEndian);
  const reserved = readUInt(input, 16, 6, isBigEndian);
  if (byteSize !== 8 || reserved !== 0) {
    throw new TypeError("Invalid BigTIFF header");
  }
}
const signatures = /* @__PURE__ */ new Set([
  "49492a00",
  // Little Endian
  "4d4d002a",
  // Big Endian
  "49492b00",
  // BigTIFF Little Endian
  "4d4d002b"
  // BigTIFF Big Endian
]);
const TIFF = {
  validate: (input) => {
    const signature = toHexString(input, 0, 4);
    return signatures.has(signature);
  },
  calculate(input) {
    const format = determineFormat(input);
    if (format.isBigTiff) {
      validateBigTIFFHeader(input, format.isBigEndian);
    }
    const ifdBuffer = readIFD(input, format);
    const tags = extractTags(ifdBuffer, format);
    const info = {
      height: tags[CONSTANTS.TAG.HEIGHT],
      width: tags[CONSTANTS.TAG.WIDTH],
      type: format.isBigTiff ? "bigtiff" : "tiff"
    };
    if (tags[CONSTANTS.TAG.COMPRESSION]) {
      info.compression = tags[CONSTANTS.TAG.COMPRESSION];
    }
    if (!info.width || !info.height) {
      throw new TypeError("Invalid Tiff. Missing tags");
    }
    return info;
  }
};

function calculateExtended(input) {
  return {
    height: 1 + readUInt24LE(input, 7),
    width: 1 + readUInt24LE(input, 4)
  };
}
function calculateLossless(input) {
  return {
    height: 1 + ((input[4] & 15) << 10 | input[3] << 2 | (input[2] & 192) >> 6),
    width: 1 + ((input[2] & 63) << 8 | input[1])
  };
}
function calculateLossy(input) {
  return {
    height: readInt16LE(input, 8) & 16383,
    width: readInt16LE(input, 6) & 16383
  };
}
const WEBP = {
  validate(input) {
    const riffHeader = "RIFF" === toUTF8String(input, 0, 4);
    const webpHeader = "WEBP" === toUTF8String(input, 8, 12);
    const vp8Header = "VP8" === toUTF8String(input, 12, 15);
    return riffHeader && webpHeader && vp8Header;
  },
  calculate(_input) {
    const chunkHeader = toUTF8String(_input, 12, 16);
    const input = _input.slice(20, 30);
    if (chunkHeader === "VP8X") {
      const extendedHeader = input[0];
      const validStart = (extendedHeader & 192) === 0;
      const validEnd = (extendedHeader & 1) === 0;
      if (validStart && validEnd) {
        return calculateExtended(input);
      }
      throw new TypeError("Invalid WebP");
    }
    if (chunkHeader === "VP8 " && input[0] !== 47) {
      return calculateLossy(input);
    }
    const signature = toHexString(input, 3, 6);
    if (chunkHeader === "VP8L" && signature !== "9d012a") {
      return calculateLossless(input);
    }
    throw new TypeError("Invalid WebP");
  }
};

const typeHandlers = /* @__PURE__ */ new Map([
  ["bmp", BMP],
  ["cur", CUR],
  ["dds", DDS],
  ["gif", GIF],
  ["heif", HEIF],
  ["icns", ICNS],
  ["ico", ICO],
  ["j2c", J2C],
  ["jp2", JP2],
  ["jpg", JPG],
  ["jxl", JXL],
  ["jxl-stream", JXLStream],
  ["ktx", KTX],
  ["png", PNG],
  ["pnm", PNM],
  ["psd", PSD],
  ["svg", SVG],
  ["tga", TGA],
  ["tiff", TIFF],
  ["webp", WEBP]
]);
const types = Array.from(typeHandlers.keys());

function appendForwardSlash(path) {
  return path.endsWith("/") ? path : path + "/";
}
function prependForwardSlash(path) {
  return path[0] === "/" ? path : "/" + path;
}
const MANY_LEADING_SLASHES = /^\/{2,}/;
function collapseDuplicateLeadingSlashes(path) {
  if (!path) {
    return path;
  }
  return path.replace(MANY_LEADING_SLASHES, "/");
}
const MANY_SLASHES = /\/{2,}/g;
function collapseDuplicateSlashes(path) {
  if (!path) {
    return path;
  }
  return path.replace(MANY_SLASHES, "/");
}
const MANY_TRAILING_SLASHES = /\/{2,}$/g;
function collapseDuplicateTrailingSlashes(path, trailingSlash) {
  if (!path) {
    return path;
  }
  return path.replace(MANY_TRAILING_SLASHES, trailingSlash ? "/" : "") || "/";
}
function removeTrailingForwardSlash(path) {
  return path.endsWith("/") ? path.slice(0, path.length - 1) : path;
}
function removeLeadingForwardSlash(path) {
  return path.startsWith("/") ? path.substring(1) : path;
}
function trimSlashes(path) {
  return path.replace(/^\/|\/$/g, "");
}
function isString(path) {
  return typeof path === "string" || path instanceof String;
}
const INTERNAL_PREFIXES = /* @__PURE__ */ new Set(["/_", "/@", "/.", "//"]);
const JUST_SLASHES = /^\/{2,}$/;
function isInternalPath(path) {
  return INTERNAL_PREFIXES.has(path.slice(0, 2)) && !JUST_SLASHES.test(path);
}
function joinPaths(...paths) {
  return paths.filter(isString).map((path, i) => {
    if (i === 0) {
      return removeTrailingForwardSlash(path);
    } else if (i === paths.length - 1) {
      return removeLeadingForwardSlash(path);
    } else {
      return trimSlashes(path);
    }
  }).join("/");
}
function removeQueryString(path) {
  const index = path.lastIndexOf("?");
  return index > 0 ? path.substring(0, index) : path;
}
function isRemotePath(src) {
  if (!src) return false;
  const trimmed = src.trim();
  if (!trimmed) return false;
  let decoded = trimmed;
  let previousDecoded = "";
  let maxIterations = 10;
  while (decoded !== previousDecoded && maxIterations > 0) {
    previousDecoded = decoded;
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      break;
    }
    maxIterations--;
  }
  if (/^[a-zA-Z]:/.test(decoded)) {
    return false;
  }
  if (decoded[0] === "/" && /^\/[\w.@-]/.test(decoded)) {
    return false;
  }
  if (decoded[0] === "\\") {
    return true;
  }
  if (decoded.startsWith("//")) {
    return true;
  }
  try {
    const url = new URL(decoded, "http://n");
    if (url.username || url.password) {
      return true;
    }
    if (decoded.includes("@") && !url.pathname.includes("@") && !url.search.includes("@")) {
      return true;
    }
    if (url.origin !== "http://n") {
      const protocol = url.protocol.toLowerCase();
      if (protocol === "file:") {
        return false;
      }
      return true;
    }
    if (URL.canParse(decoded)) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}
function slash(path) {
  return path.replace(/\\/g, "/");
}
function fileExtension(path) {
  const ext = path.split(".").pop();
  return ext !== path ? `.${ext}` : "";
}
const WITH_FILE_EXT = /\/[^/]+\.\w+$/;
function hasFileExtension(path) {
  return WITH_FILE_EXT.test(path);
}

nodePath.posix.join;

const ASTRO_PATH_HEADER = "x-astro-path";
const ASTRO_PATH_PARAM = "x_astro_path";
const ASTRO_LOCALS_HEADER = "x-astro-locals";
const ASTRO_MIDDLEWARE_SECRET_HEADER = "x-astro-middleware-secret";

const middlewareSecret = "e6c11e36-fd68-4b52-96b5-69fdd80dea4e";

const ACTION_QUERY_PARAMS = {
  actionName: "_action"};
const ACTION_RPC_ROUTE_PATTERN = "/_actions/[...path]";

const __vite_import_meta_env__$1 = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": undefined, "SSR": true};
const codeToStatusMap = {
  // Implemented from IANA HTTP Status Code Registry
  // https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  CONTENT_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_CONTENT: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NETWORK_AUTHENTICATION_REQUIRED: 511
};
const statusToCodeMap = Object.fromEntries(
  Object.entries(codeToStatusMap).map(([key, value]) => [value, key])
);
class ActionError extends Error {
  type = "AstroActionError";
  code = "INTERNAL_SERVER_ERROR";
  status = 500;
  constructor(params) {
    super(params.message);
    this.code = params.code;
    this.status = ActionError.codeToStatus(params.code);
    if (params.stack) {
      this.stack = params.stack;
    }
  }
  static codeToStatus(code) {
    return codeToStatusMap[code];
  }
  static statusToCode(status) {
    return statusToCodeMap[status] ?? "INTERNAL_SERVER_ERROR";
  }
  static fromJson(body) {
    if (isInputError(body)) {
      return new ActionInputError(body.issues);
    }
    if (isActionError(body)) {
      return new ActionError(body);
    }
    return new ActionError({
      code: "INTERNAL_SERVER_ERROR"
    });
  }
}
function isActionError(error) {
  return typeof error === "object" && error != null && "type" in error && error.type === "AstroActionError";
}
function isInputError(error) {
  return typeof error === "object" && error != null && "type" in error && error.type === "AstroActionInputError" && "issues" in error && Array.isArray(error.issues);
}
class ActionInputError extends ActionError {
  type = "AstroActionInputError";
  // We don't expose all ZodError properties.
  // Not all properties will serialize from server to client,
  // and we don't want to import the full ZodError object into the client.
  issues;
  fields;
  constructor(issues) {
    super({
      message: `Failed to validate: ${JSON.stringify(issues, null, 2)}`,
      code: "BAD_REQUEST"
    });
    this.issues = issues;
    this.fields = {};
    for (const issue of issues) {
      if (issue.path.length > 0) {
        const key = issue.path[0].toString();
        this.fields[key] ??= [];
        this.fields[key]?.push(issue.message);
      }
    }
  }
}
function deserializeActionResult(res) {
  if (res.type === "error") {
    let json;
    try {
      json = JSON.parse(res.body);
    } catch {
      return {
        data: void 0,
        error: new ActionError({
          message: res.body,
          code: "INTERNAL_SERVER_ERROR"
        })
      };
    }
    if (Object.assign(__vite_import_meta_env__$1, { OS: "Windows_NT" })?.PROD) {
      return { error: ActionError.fromJson(json), data: void 0 };
    } else {
      const error = ActionError.fromJson(json);
      error.stack = actionResultErrorStack.get();
      return {
        error,
        data: void 0
      };
    }
  }
  if (res.type === "empty") {
    return { data: void 0, error: void 0 };
  }
  return {
    data: parse(res.body, {
      URL: (href) => new URL(href)
    }),
    error: void 0
  };
}
const actionResultErrorStack = /* @__PURE__ */ (function actionResultErrorStackFn() {
  let errorStack;
  return {
    set(stack) {
      errorStack = stack;
    },
    get() {
      return errorStack;
    }
  };
})();
function getActionQueryString(name) {
  const searchParams = new URLSearchParams({ [ACTION_QUERY_PARAMS.actionName]: name });
  return `?${searchParams.toString()}`;
}

function shouldAppendForwardSlash(trailingSlash, buildFormat) {
  switch (trailingSlash) {
    case "always":
      return true;
    case "never":
      return false;
    case "ignore": {
      switch (buildFormat) {
        case "directory":
          return true;
        case "preserve":
        case "file":
          return false;
      }
    }
  }
}

const ASTRO_VERSION = "6.4.8";
const ASTRO_GENERATOR = `Astro v${ASTRO_VERSION}`;
const REROUTE_DIRECTIVE_HEADER = "X-Astro-Reroute";
const REWRITE_DIRECTIVE_HEADER_KEY = "X-Astro-Rewrite";
const REWRITE_DIRECTIVE_HEADER_VALUE = "yes";
const NOOP_MIDDLEWARE_HEADER = "X-Astro-Noop";
const ROUTE_TYPE_HEADER = "X-Astro-Route-Type";
const INTERNAL_RESPONSE_HEADERS = [
  REROUTE_DIRECTIVE_HEADER,
  REWRITE_DIRECTIVE_HEADER_KEY,
  NOOP_MIDDLEWARE_HEADER,
  ROUTE_TYPE_HEADER
];
const ASTRO_ERROR_HEADER = "X-Astro-Error";
const DEFAULT_404_COMPONENT = "astro-default-404.astro";
const REDIRECT_STATUS_CODES = [301, 302, 303, 307, 308, 300, 304];
const REROUTABLE_STATUS_CODES = [404, 500];
const clientAddressSymbol = /* @__PURE__ */ Symbol.for("astro.clientAddress");
const originPathnameSymbol = /* @__PURE__ */ Symbol.for("astro.originPathname");
const pipelineSymbol = /* @__PURE__ */ Symbol.for("astro.pipeline");
const fetchStateSymbol = /* @__PURE__ */ Symbol.for("astro.fetchState");
const appSymbol = /* @__PURE__ */ Symbol.for("astro.app");
const responseSentSymbol$1 = /* @__PURE__ */ Symbol.for("astro.responseSent");

async function readBodyWithLimit(request, limit) {
  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader) {
    const contentLength = Number.parseInt(contentLengthHeader, 10);
    if (Number.isFinite(contentLength) && contentLength > limit) {
      throw new BodySizeLimitError(limit);
    }
  }
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      received += value.byteLength;
      if (received > limit) {
        throw new BodySizeLimitError(limit);
      }
      chunks.push(value);
    }
  }
  const buffer = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return buffer;
}
class BodySizeLimitError extends Error {
  limit;
  constructor(limit) {
    super(`Request body exceeds the configured limit of ${limit} bytes`);
    this.name = "BodySizeLimitError";
    this.limit = limit;
  }
}

const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": undefined, "SSR": true};
function getActionContext(context) {
  const callerInfo = getCallerInfo(context);
  const actionResultAlreadySet = Boolean(context.locals._actionPayload);
  let action = void 0;
  if (callerInfo && context.request.method === "POST" && !actionResultAlreadySet) {
    action = {
      calledFrom: callerInfo.from,
      name: callerInfo.name,
      handler: async () => {
        const pipeline = Reflect.get(context, pipelineSymbol);
        const callerInfoName = shouldAppendForwardSlash(
          pipeline.manifest.trailingSlash,
          pipeline.manifest.buildFormat
        ) ? removeTrailingForwardSlash(callerInfo.name) : callerInfo.name;
        let baseAction;
        try {
          baseAction = await pipeline.getAction(callerInfoName);
        } catch (error) {
          if (error instanceof Error && "name" in error && typeof error.name === "string" && error.name === ActionNotFoundError.name) {
            return { data: void 0, error: new ActionError({ code: "NOT_FOUND" }) };
          }
          throw error;
        }
        const bodySizeLimit = pipeline.manifest.actionBodySizeLimit;
        let input;
        try {
          input = await parseRequestBody(context.request, bodySizeLimit);
        } catch (e) {
          if (e instanceof ActionError) {
            return { data: void 0, error: e };
          }
          if (e instanceof TypeError) {
            return { data: void 0, error: new ActionError({ code: "UNSUPPORTED_MEDIA_TYPE" }) };
          }
          throw e;
        }
        const omitKeys = ["props", "getActionResult", "callAction", "redirect"];
        const actionAPIContext = Object.create(
          Object.getPrototypeOf(context),
          Object.fromEntries(
            Object.entries(Object.getOwnPropertyDescriptors(context)).filter(
              ([key]) => !omitKeys.includes(key)
            )
          )
        );
        Reflect.set(actionAPIContext, ACTION_API_CONTEXT_SYMBOL, true);
        const handler = baseAction.bind(actionAPIContext);
        return handler(input);
      }
    };
  }
  function setActionResult(actionName, actionResult) {
    context.locals._actionPayload = {
      actionResult,
      actionName
    };
  }
  return {
    action,
    setActionResult,
    serializeActionResult,
    deserializeActionResult
  };
}
function getCallerInfo(ctx) {
  if (ctx.routePattern === ACTION_RPC_ROUTE_PATTERN) {
    return { from: "rpc", name: ctx.url.pathname.replace(/^.*\/_actions\//, "") };
  }
  const queryParam = ctx.url.searchParams.get(ACTION_QUERY_PARAMS.actionName);
  if (queryParam) {
    return { from: "form", name: queryParam };
  }
  return void 0;
}
async function parseRequestBody(request, bodySizeLimit) {
  const contentType = request.headers.get("content-type");
  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = contentLengthHeader ? Number.parseInt(contentLengthHeader, 10) : void 0;
  const hasContentLength = typeof contentLength === "number" && Number.isFinite(contentLength);
  if (!contentType) return void 0;
  if (hasContentLength && contentLength > bodySizeLimit) {
    throw new ActionError({
      code: "CONTENT_TOO_LARGE",
      message: `Request body exceeds ${bodySizeLimit} bytes`
    });
  }
  try {
    if (hasContentType(contentType, formContentTypes$1)) {
      if (!hasContentLength) {
        const body = await readBodyWithLimit(request.clone(), bodySizeLimit);
        const formRequest = new Request(request.url, {
          method: request.method,
          headers: request.headers,
          body: toArrayBuffer(body)
        });
        return await formRequest.formData();
      }
      return await request.clone().formData();
    }
    if (hasContentType(contentType, ["application/json"])) {
      if (contentLength === 0) return void 0;
      if (!hasContentLength) {
        const body = await readBodyWithLimit(request.clone(), bodySizeLimit);
        if (body.byteLength === 0) return void 0;
        return JSON.parse(new TextDecoder().decode(body));
      }
      return await request.clone().json();
    }
  } catch (e) {
    if (e instanceof BodySizeLimitError) {
      throw new ActionError({
        code: "CONTENT_TOO_LARGE",
        message: `Request body exceeds ${bodySizeLimit} bytes`
      });
    }
    throw e;
  }
  throw new TypeError("Unsupported content type");
}
const ACTION_API_CONTEXT_SYMBOL = /* @__PURE__ */ Symbol.for("astro.actionAPIContext");
const formContentTypes$1 = ["application/x-www-form-urlencoded", "multipart/form-data"];
function hasContentType(contentType, expected) {
  const type = contentType.split(";")[0].toLowerCase();
  return expected.some((t) => type === t);
}
function serializeActionResult(res) {
  if (res.error) {
    if (Object.assign(__vite_import_meta_env__, { OS: "Windows_NT" })?.DEV) {
      actionResultErrorStack.set(res.error.stack);
    }
    let body2;
    if (res.error instanceof ActionInputError) {
      body2 = {
        type: res.error.type,
        issues: res.error.issues,
        fields: res.error.fields
      };
    } else {
      body2 = {
        ...res.error,
        message: res.error.message
      };
    }
    return {
      type: "error",
      status: res.error.status,
      contentType: "application/json",
      body: JSON.stringify(body2)
    };
  }
  if (res.data === void 0) {
    return {
      type: "empty",
      status: 204
    };
  }
  let body;
  try {
    body = stringify$1(res.data, {
      // Add support for URL objects
      URL: (value) => value instanceof URL && value.href
    });
  } catch (e) {
    let hint = ActionsReturnedInvalidDataError.hint;
    if (res.data instanceof Response) {
      hint = REDIRECT_STATUS_CODES.includes(res.data.status) ? "If you need to redirect when the action succeeds, trigger a redirect where the action is called. See the Actions guide for server and client redirect examples: https://docs.astro.build/en/guides/actions." : "If you need to return a Response object, try using a server endpoint instead. See https://docs.astro.build/en/guides/endpoints/#server-endpoints-api-routes";
    }
    throw new AstroError({
      ...ActionsReturnedInvalidDataError,
      message: ActionsReturnedInvalidDataError.message(String(e)),
      hint
    });
  }
  return {
    type: "data",
    status: 200,
    contentType: "application/json+devalue",
    body
  };
}
function toArrayBuffer(buffer) {
  const copy = new Uint8Array(buffer.byteLength);
  copy.set(buffer);
  return copy.buffer;
}

function hasActionPayload(locals) {
  return "_actionPayload" in locals;
}
function createGetActionResult(locals) {
  return (actionFn) => {
    if (!hasActionPayload(locals) || actionFn.toString() !== getActionQueryString(locals._actionPayload.actionName)) {
      return void 0;
    }
    return deserializeActionResult(locals._actionPayload.actionResult);
  };
}
function createCallAction(context) {
  return (baseAction, input) => {
    Reflect.set(context, ACTION_API_CONTEXT_SYMBOL, true);
    const action = baseAction.bind(context);
    return action(input);
  };
}

const DELETED_EXPIRATION = /* @__PURE__ */ new Date(0);
const DELETED_VALUE = "deleted";
const responseSentSymbol = /* @__PURE__ */ Symbol.for("astro.responseSent");
const identity = (value) => value;
class AstroCookie {
  value;
  constructor(value) {
    this.value = value;
  }
  json() {
    if (this.value === void 0) {
      throw new Error(`Cannot convert undefined to an object.`);
    }
    return JSON.parse(this.value);
  }
  number() {
    return Number(this.value);
  }
  boolean() {
    if (this.value === "false") return false;
    if (this.value === "0") return false;
    return Boolean(this.value);
  }
}
class AstroCookies {
  #request;
  #requestValues;
  #outgoing;
  #consumed;
  constructor(request) {
    this.#request = request;
    this.#requestValues = null;
    this.#outgoing = null;
    this.#consumed = false;
  }
  /**
   * Astro.cookies.delete(key) is used to delete a cookie. Using this method will result
   * in a Set-Cookie header added to the response.
   * @param key The cookie to delete
   * @param options Options related to this deletion, such as the path of the cookie.
   */
  delete(key, options) {
    const {
      // @ts-expect-error
      maxAge: _ignoredMaxAge,
      // @ts-expect-error
      expires: _ignoredExpires,
      ...sanitizedOptions
    } = options || {};
    const serializeOptions = {
      expires: DELETED_EXPIRATION,
      ...sanitizedOptions
    };
    this.#ensureOutgoingMap().set(key, [
      DELETED_VALUE,
      serialize(key, DELETED_VALUE, serializeOptions),
      false
    ]);
  }
  /**
   * Astro.cookies.get(key) is used to get a cookie value. The cookie value is read from the
   * request. If you have set a cookie via Astro.cookies.set(key, value), the value will be taken
   * from that set call, overriding any values already part of the request.
   * @param key The cookie to get.
   * @returns An object containing the cookie value as well as convenience methods for converting its value.
   */
  get(key, options = void 0) {
    if (this.#outgoing?.has(key)) {
      let [serializedValue, , isSetValue] = this.#outgoing.get(key);
      if (isSetValue) {
        return new AstroCookie(serializedValue);
      } else {
        return void 0;
      }
    }
    const decode = options?.decode ?? decodeURIComponent;
    const values = this.#ensureParsed();
    if (key in values) {
      const value = values[key];
      if (value) {
        let decodedValue;
        try {
          decodedValue = decode(value);
        } catch (_error) {
          decodedValue = value;
        }
        return new AstroCookie(decodedValue);
      }
    }
  }
  /**
   * Astro.cookies.has(key) returns a boolean indicating whether this cookie is either
   * part of the initial request or set via Astro.cookies.set(key)
   * @param key The cookie to check for.
   * @param _options This parameter is no longer used.
   * @returns
   */
  has(key, _options) {
    if (this.#outgoing?.has(key)) {
      let [, , isSetValue] = this.#outgoing.get(key);
      return isSetValue;
    }
    const values = this.#ensureParsed();
    return values[key] !== void 0;
  }
  /**
   * Astro.cookies.set(key, value) is used to set a cookie's value. If provided
   * an object it will be stringified via JSON.stringify(value). Additionally you
   * can provide options customizing how this cookie will be set, such as setting httpOnly
   * in order to prevent the cookie from being read in client-side JavaScript.
   * @param key The name of the cookie to set.
   * @param value A value, either a string or other primitive or an object.
   * @param options Options for the cookie, such as the path and security settings.
   */
  set(key, value, options) {
    if (this.#consumed) {
      const warning = new Error(
        "Astro.cookies.set() was called after the cookies had already been sent to the browser.\nThis may have happened if this method was called in an imported component.\nPlease make sure that Astro.cookies.set() is only called in the frontmatter of the main page."
      );
      warning.name = "Warning";
      console.warn(warning);
    }
    let serializedValue;
    if (typeof value === "string") {
      serializedValue = value;
    } else {
      let toStringValue = value.toString();
      if (toStringValue === Object.prototype.toString.call(value)) {
        serializedValue = JSON.stringify(value);
      } else {
        serializedValue = toStringValue;
      }
    }
    const serializeOptions = {};
    if (options) {
      Object.assign(serializeOptions, options);
    }
    this.#ensureOutgoingMap().set(key, [
      serializedValue,
      serialize(key, serializedValue, serializeOptions),
      true
    ]);
    if (this.#request[responseSentSymbol]) {
      throw new AstroError({
        ...ResponseSentError
      });
    }
  }
  /**
   * Merges a new AstroCookies instance into the current instance. Any new cookies
   * will be added to the current instance, overwriting any existing cookies with the same name.
   */
  merge(cookies) {
    const outgoing = cookies.#outgoing;
    if (outgoing) {
      for (const [key, value] of outgoing) {
        this.#ensureOutgoingMap().set(key, value);
      }
    }
  }
  /**
   * Astro.cookies.header() returns an iterator for the cookies that have previously
   * been set by either Astro.cookies.set() or Astro.cookies.delete().
   * This method is primarily used by adapters to set the header on outgoing responses.
   * @returns
   */
  *headers() {
    if (this.#outgoing == null) return;
    for (const [, value] of this.#outgoing) {
      yield value[1];
    }
  }
  /**
   * Marks the cookies as consumed and returns the header values.
   * After consumption, any subsequent `set()` calls will warn.
   */
  consume() {
    this.#consumed = true;
    return this.headers();
  }
  /**
   * @deprecated Use the instance method `cookies.consume()` instead.
   * Kept for backward compatibility with adapters.
   */
  static consume(cookies) {
    return cookies.consume();
  }
  #ensureParsed() {
    if (!this.#requestValues) {
      this.#parse();
    }
    if (!this.#requestValues) {
      this.#requestValues = /* @__PURE__ */ Object.create(null);
    }
    return this.#requestValues;
  }
  #ensureOutgoingMap() {
    if (!this.#outgoing) {
      this.#outgoing = /* @__PURE__ */ new Map();
    }
    return this.#outgoing;
  }
  #parse() {
    const raw = this.#request.headers.get("cookie");
    if (!raw) {
      return;
    }
    this.#requestValues = parse$1(raw, { decode: identity });
  }
}

const astroCookiesSymbol = /* @__PURE__ */ Symbol.for("astro.cookies");
function attachCookiesToResponse(response, cookies) {
  Reflect.set(response, astroCookiesSymbol, cookies);
}
function getCookiesFromResponse(response) {
  let cookies = Reflect.get(response, astroCookiesSymbol);
  if (cookies != null) {
    return cookies;
  } else {
    return void 0;
  }
}
function* getSetCookiesFromResponse(response) {
  const cookies = getCookiesFromResponse(response);
  if (!cookies) {
    return [];
  }
  for (const headerValue of cookies.consume()) {
    yield headerValue;
  }
  return [];
}

const NOOP_ACTIONS_MOD = {
  server: {}
};

function defineMiddleware(fn) {
  return fn;
}

const FORM_CONTENT_TYPES = [
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain"
];
const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];
function createOriginCheckMiddleware() {
  return defineMiddleware((context, next) => {
    const { request, url, isPrerendered } = context;
    if (isPrerendered) {
      return next();
    }
    if (SAFE_METHODS.includes(request.method)) {
      return next();
    }
    const isSameOrigin = request.headers.get("origin") === url.origin;
    const hasContentType = request.headers.has("content-type");
    if (hasContentType) {
      const formLikeHeader = hasFormLikeHeader(request.headers.get("content-type"));
      if (formLikeHeader && !isSameOrigin) {
        return new Response(`Cross-site ${request.method} form submissions are forbidden`, {
          status: 403
        });
      }
    } else {
      if (!isSameOrigin) {
        return new Response(`Cross-site ${request.method} form submissions are forbidden`, {
          status: 403
        });
      }
    }
    return next();
  });
}
function hasFormLikeHeader(contentType) {
  if (contentType) {
    for (const FORM_CONTENT_TYPE of FORM_CONTENT_TYPES) {
      if (contentType.toLowerCase().includes(FORM_CONTENT_TYPE)) {
        return true;
      }
    }
  }
  return false;
}

const NOOP_MIDDLEWARE_FN = async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
};

function createRequest({
  url,
  headers,
  method = "GET",
  body = void 0,
  logger,
  isPrerendered = false,
  routePattern,
  init
}) {
  const headersObj = isPrerendered ? void 0 : headers instanceof Headers ? headers : new Headers(
    // Filter out HTTP/2 pseudo-headers. These are internally-generated headers added to all HTTP/2 requests with trusted metadata about the request.
    // Examples include `:method`, `:scheme`, `:authority`, and `:path`.
    // They are always prefixed with a colon to distinguish them from other headers, and it is an error to add the to a Headers object manually.
    // See https://httpwg.org/specs/rfc7540.html#HttpRequest
    Object.entries(headers).filter(([name]) => !name.startsWith(":"))
  );
  if (typeof url === "string") url = new URL(url);
  if (isPrerendered) {
    url.search = "";
  }
  const request = new Request(url, {
    method,
    headers: headersObj,
    // body is made available only if the request is for a page that will be on-demand rendered
    body: isPrerendered ? null : body,
    ...init
  });
  if (isPrerendered) {
    let _headers = request.headers;
    const { value, writable, ...headersDesc } = Object.getOwnPropertyDescriptor(request, "headers") || {};
    Object.defineProperty(request, "headers", {
      ...headersDesc,
      get() {
        logger.warn(
          null,
          `\`Astro.request.headers\` was used when rendering the route \`${routePattern}'\`. \`Astro.request.headers\` is not available on prerendered pages. If you need access to request headers, make sure that the page is server-rendered using \`export const prerender = false;\` or by setting \`output\` to \`"server"\` in your Astro config to make all your pages server-rendered by default.`
        );
        return _headers;
      },
      set(newHeaders) {
        _headers = newHeaders;
      }
    });
  }
  return request;
}

class MultiLevelEncodingError extends Error {
  constructor() {
    super("URL encoding depth exceeded the maximum number of decode iterations");
    this.name = "MultiLevelEncodingError";
  }
}
const MAX_DECODE_ITERATIONS = 10;
function validateAndDecodePathname(pathname) {
  let decoded;
  try {
    decoded = decodeURI(pathname);
  } catch (_e) {
    throw new Error("Invalid URL encoding");
  }
  let iterations = 0;
  while (decoded !== pathname) {
    if (iterations >= MAX_DECODE_ITERATIONS) {
      throw new MultiLevelEncodingError();
    }
    pathname = decoded;
    try {
      decoded = decodeURI(pathname);
    } catch {
      break;
    }
    iterations++;
  }
  return decoded;
}

function template({
  title,
  pathname,
  statusCode = 404,
  tabTitle,
  body
}) {
  return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title>${tabTitle}</title>
		<style>
			:root {
				--gray-10: hsl(258, 7%, 10%);
				--gray-20: hsl(258, 7%, 20%);
				--gray-30: hsl(258, 7%, 30%);
				--gray-40: hsl(258, 7%, 40%);
				--gray-50: hsl(258, 7%, 50%);
				--gray-60: hsl(258, 7%, 60%);
				--gray-70: hsl(258, 7%, 70%);
				--gray-80: hsl(258, 7%, 80%);
				--gray-90: hsl(258, 7%, 90%);
				--black: #13151A;
				--accent-light: #E0CCFA;
			}

			* {
				box-sizing: border-box;
			}

			html {
				background: var(--black);
				color-scheme: dark;
				accent-color: var(--accent-light);
			}

			body {
				background-color: var(--gray-10);
				color: var(--gray-80);
				font-family: ui-monospace, Menlo, Monaco, "Cascadia Mono", "Segoe UI Mono", "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace", "Source Code Pro", "Fira Mono", "Droid Sans Mono", "Courier New", monospace;
				line-height: 1.5;
				margin: 0;
			}

			a {
				color: var(--accent-light);
			}

			.center {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				height: 100vh;
				width: 100vw;
			}

			h1 {
				margin-bottom: 8px;
				color: white;
				font-family: system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
				font-weight: 700;
				margin-top: 1rem;
				margin-bottom: 0;
			}

			.statusCode {
				color: var(--accent-light);
			}

			.astro-icon {
				height: 124px;
				width: 124px;
			}

			pre, code {
				padding: 2px 8px;
				background: rgba(0,0,0, 0.25);
				border: 1px solid rgba(255,255,255, 0.25);
				border-radius: 4px;
				font-size: 1.2em;
				margin-top: 0;
				max-width: 60em;
			}
		</style>
	</head>
	<body>
		<main class="center">
			<svg class="astro-icon" xmlns="http://www.w3.org/2000/svg" width="64" height="80" viewBox="0 0 64 80" fill="none"> <path d="M20.5253 67.6322C16.9291 64.3531 15.8793 57.4632 17.3776 52.4717C19.9755 55.6188 23.575 56.6157 27.3035 57.1784C33.0594 58.0468 38.7122 57.722 44.0592 55.0977C44.6709 54.7972 45.2362 54.3978 45.9045 53.9931C46.4062 55.4451 46.5368 56.9109 46.3616 58.4028C45.9355 62.0362 44.1228 64.8429 41.2397 66.9705C40.0868 67.8215 38.8669 68.5822 37.6762 69.3846C34.0181 71.8508 33.0285 74.7426 34.403 78.9491C34.4357 79.0516 34.4649 79.1541 34.5388 79.4042C32.6711 78.5705 31.3069 77.3565 30.2674 75.7604C29.1694 74.0757 28.6471 72.2121 28.6196 70.1957C28.6059 69.2144 28.6059 68.2244 28.4736 67.257C28.1506 64.8985 27.0406 63.8425 24.9496 63.7817C22.8036 63.7192 21.106 65.0426 20.6559 67.1268C20.6215 67.2865 20.5717 67.4446 20.5218 67.6304L20.5253 67.6322Z" fill="white"/> <path d="M20.5253 67.6322C16.9291 64.3531 15.8793 57.4632 17.3776 52.4717C19.9755 55.6188 23.575 56.6157 27.3035 57.1784C33.0594 58.0468 38.7122 57.722 44.0592 55.0977C44.6709 54.7972 45.2362 54.3978 45.9045 53.9931C46.4062 55.4451 46.5368 56.9109 46.3616 58.4028C45.9355 62.0362 44.1228 64.8429 41.2397 66.9705C40.0868 67.8215 38.8669 68.5822 37.6762 69.3846C34.0181 71.8508 33.0285 74.7426 34.403 78.9491C34.4357 79.0516 34.4649 79.1541 34.5388 79.4042C32.6711 78.5705 31.3069 77.3565 30.2674 75.7604C29.1694 74.0757 28.6471 72.2121 28.6196 70.1957C28.6059 69.2144 28.6059 68.2244 28.4736 67.257C28.1506 64.8985 27.0406 63.8425 24.9496 63.7817C22.8036 63.7192 21.106 65.0426 20.6559 67.1268C20.6215 67.2865 20.5717 67.4446 20.5218 67.6304L20.5253 67.6322Z" fill="url(#paint0_linear_738_686)"/> <path d="M0 51.6401C0 51.6401 10.6488 46.4654 21.3274 46.4654L29.3786 21.6102C29.6801 20.4082 30.5602 19.5913 31.5538 19.5913C32.5474 19.5913 33.4275 20.4082 33.7289 21.6102L41.7802 46.4654C54.4274 46.4654 63.1076 51.6401 63.1076 51.6401C63.1076 51.6401 45.0197 2.48776 44.9843 2.38914C44.4652 0.935933 43.5888 0 42.4073 0H20.7022C19.5206 0 18.6796 0.935933 18.1251 2.38914C18.086 2.4859 0 51.6401 0 51.6401Z" fill="white"/> <defs> <linearGradient id="paint0_linear_738_686" x1="31.554" y1="75.4423" x2="39.7462" y2="48.376" gradientUnits="userSpaceOnUse"> <stop stop-color="#D83333"/> <stop offset="1" stop-color="#F041FF"/> </linearGradient> </defs> </svg>
			<h1>${statusCode ? `<span class="statusCode">${statusCode}: </span> ` : ""}<span class="statusMessage">${title}</span></h1>
			${body || `
				<pre>Path: ${escape(pathname)}</pre>
			`}
			</main>
	</body>
</html>`;
}

const DEFAULT_404_ROUTE = {
  component: DEFAULT_404_COMPONENT,
  params: [],
  pattern: /^\/404\/?$/,
  prerender: false,
  pathname: "/404",
  segments: [[{ content: "404", dynamic: false, spread: false }]],
  type: "page",
  route: "/404",
  fallbackRoutes: [],
  isIndex: false,
  origin: "internal",
  distURL: []
};
async function default404Page({ pathname }) {
  return new Response(
    template({
      statusCode: 404,
      title: "Not found",
      tabTitle: "404: Not Found",
      pathname
    }),
    { status: 404, headers: { "Content-Type": "text/html" } }
  );
}
default404Page.isAstroComponentFactory = true;
const default404Instance = {
  default: default404Page
};

const ROUTE404_RE = /^\/404\/?$/;
const ROUTE500_RE = /^\/500\/?$/;
function isRoute404(route) {
  return ROUTE404_RE.test(route);
}
function isRoute500(route) {
  return ROUTE500_RE.test(route);
}

function findRouteToRewrite({
  payload,
  routes,
  request,
  trailingSlash,
  buildFormat,
  base,
  outDir
}) {
  let newUrl = void 0;
  if (payload instanceof URL) {
    newUrl = payload;
  } else if (payload instanceof Request) {
    newUrl = new URL(payload.url);
  } else {
    newUrl = new URL(collapseDuplicateSlashes(payload), new URL(request.url).origin);
  }
  const { pathname, resolvedUrlPathname } = normalizeRewritePathname(
    newUrl.pathname,
    base,
    trailingSlash,
    buildFormat
  );
  newUrl.pathname = resolvedUrlPathname;
  const decodedPathname = validateAndDecodePathname(pathname);
  if (isRoute404(decodedPathname)) {
    const errorRoute = routes.find((route) => route.route === "/404");
    if (errorRoute) {
      return { routeData: errorRoute, newUrl, pathname: decodedPathname };
    }
  }
  if (isRoute500(decodedPathname)) {
    const errorRoute = routes.find((route) => route.route === "/500");
    if (errorRoute) {
      return { routeData: errorRoute, newUrl, pathname: decodedPathname };
    }
  }
  let foundRoute;
  for (const route of routes) {
    if (route.pattern.test(decodedPathname)) {
      if (route.params && route.params.length !== 0 && route.distURL && route.distURL.length !== 0) {
        if (!route.distURL.find(
          (url) => url.href.replace(outDir.toString(), "").replace(/(?:\/index\.html|\.html)$/, "") === trimSlashes(pathname)
        )) {
          continue;
        }
      }
      foundRoute = route;
      break;
    }
  }
  if (foundRoute) {
    return {
      routeData: foundRoute,
      newUrl,
      pathname: decodedPathname
    };
  } else {
    const custom404 = routes.find((route) => route.route === "/404");
    if (custom404) {
      return { routeData: custom404, newUrl, pathname };
    } else {
      return { routeData: DEFAULT_404_ROUTE, newUrl, pathname };
    }
  }
}
function copyRequest(newUrl, oldRequest, isPrerendered, logger, routePattern) {
  if (oldRequest.bodyUsed) {
    throw new AstroError(RewriteWithBodyUsed);
  }
  return createRequest({
    url: newUrl,
    method: oldRequest.method,
    body: oldRequest.body,
    isPrerendered,
    logger,
    headers: isPrerendered ? {} : oldRequest.headers,
    routePattern,
    init: {
      referrer: oldRequest.referrer,
      referrerPolicy: oldRequest.referrerPolicy,
      mode: oldRequest.mode,
      credentials: oldRequest.credentials,
      cache: oldRequest.cache,
      redirect: oldRequest.redirect,
      integrity: oldRequest.integrity,
      signal: oldRequest.signal,
      keepalive: oldRequest.keepalive,
      // https://fetch.spec.whatwg.org/#dom-request-duplex
      // @ts-expect-error It isn't part of the types, but undici accepts it and it allows carrying over the body to a new request
      duplex: "half"
    }
  });
}
function setOriginPathname(request, pathname, trailingSlash, buildFormat) {
  if (!pathname) {
    pathname = "/";
  }
  const shouldAppendSlash = shouldAppendForwardSlash(trailingSlash, buildFormat);
  let finalPathname;
  if (pathname === "/") {
    finalPathname = "/";
  } else if (shouldAppendSlash) {
    finalPathname = appendForwardSlash(pathname);
  } else {
    finalPathname = removeTrailingForwardSlash(pathname);
  }
  Reflect.set(request, originPathnameSymbol, encodeURIComponent(finalPathname));
}
function getOriginPathname(request) {
  const origin = Reflect.get(request, originPathnameSymbol);
  if (origin) {
    return decodeURIComponent(origin);
  }
  return new URL(request.url).pathname;
}
function normalizeRewritePathname(urlPathname, base, trailingSlash, buildFormat) {
  let pathname = collapseDuplicateSlashes(urlPathname);
  const shouldAppendSlash = shouldAppendForwardSlash(trailingSlash, buildFormat);
  if (base !== "/") {
    const isBasePathRequest = urlPathname === base || urlPathname === removeTrailingForwardSlash(base);
    if (isBasePathRequest) {
      pathname = "/";
    } else if (urlPathname.startsWith(base)) {
      pathname = shouldAppendSlash ? appendForwardSlash(urlPathname) : removeTrailingForwardSlash(urlPathname);
      pathname = pathname.slice(base.length);
    }
  }
  if (!pathname.startsWith("/") && shouldAppendSlash && urlPathname.endsWith("/")) {
    pathname = prependForwardSlash(pathname);
  }
  if (buildFormat === "file") {
    pathname = pathname.replace(/\.html$/, "");
  }
  let resolvedUrlPathname;
  if (base !== "/" && (pathname === "" || pathname === "/") && !shouldAppendSlash) {
    resolvedUrlPathname = removeTrailingForwardSlash(base);
  } else {
    resolvedUrlPathname = joinPaths(...[base, pathname].filter(Boolean));
  }
  return { pathname, resolvedUrlPathname };
}

function sequence(...handlers) {
  const filtered = handlers.filter((h) => !!h);
  const length = filtered.length;
  if (!length) {
    return defineMiddleware((_context, next) => {
      return next();
    });
  }
  return defineMiddleware((context, next) => {
    let carriedPayload = void 0;
    return applyHandle(0, context);
    function applyHandle(i, handleContext) {
      const handle = filtered[i];
      const result = handle(handleContext, async (payload) => {
        if (i < length - 1) {
          if (payload) {
            let newRequest;
            if (payload instanceof Request) {
              newRequest = payload;
            } else if (payload instanceof URL) {
              newRequest = new Request(payload, handleContext.request.clone());
            } else {
              newRequest = new Request(
                new URL(payload, handleContext.url.origin),
                handleContext.request.clone()
              );
            }
            const oldPathname = handleContext.url.pathname;
            const pipeline = Reflect.get(handleContext, pipelineSymbol);
            const { routeData, pathname } = await pipeline.tryRewrite(
              payload,
              handleContext.request
            );
            if (pipeline.manifest.serverLike === true && handleContext.isPrerendered === false && routeData.prerender === true) {
              throw new AstroError({
                ...ForbiddenRewrite,
                message: ForbiddenRewrite.message(
                  handleContext.url.pathname,
                  pathname,
                  routeData.component
                ),
                hint: ForbiddenRewrite.hint(routeData.component)
              });
            }
            carriedPayload = payload;
            handleContext.request = newRequest;
            handleContext.url = new URL(newRequest.url);
            handleContext.params = getParams(routeData, pathname);
            handleContext.routePattern = routeData.route;
            setOriginPathname(
              handleContext.request,
              oldPathname,
              pipeline.manifest.trailingSlash,
              pipeline.manifest.buildFormat
            );
          }
          return applyHandle(i + 1, handleContext);
        } else {
          return next(payload ?? carriedPayload);
        }
      });
      return result;
    }
  });
}

const RedirectComponentInstance = {
  default() {
    return new Response(null, {
      status: 301
    });
  }
};
const RedirectSinglePageBuiltModule = {
  page: () => Promise.resolve(RedirectComponentInstance),
  onRequest: (_, next) => next()
};

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? collapseDuplicateLeadingSlashes("/" + segmentPath) : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

const VALID_PARAM_TYPES = ["string", "undefined"];
function validateGetStaticPathsParameter([key, value], route) {
  if (!VALID_PARAM_TYPES.includes(typeof value)) {
    throw new AstroError({
      ...GetStaticPathsInvalidRouteParam,
      message: GetStaticPathsInvalidRouteParam.message(key, value, typeof value),
      location: {
        file: route
      }
    });
  }
}

function stringifyParams(params, route, trailingSlash) {
  const validatedParams = {};
  for (const [key, value] of Object.entries(params)) {
    validateGetStaticPathsParameter([key, value], route.component);
    if (value !== void 0) {
      validatedParams[key] = trimSlashes(value);
    }
  }
  return getRouteGenerator(route.segments, trailingSlash)(validatedParams);
}

function validateDynamicRouteModule(mod, {
  ssr,
  route
}) {
  if ((!ssr || route.prerender) && route.origin !== "internal" && !mod.getStaticPaths) {
    throw new AstroError({
      ...GetStaticPathsRequired,
      location: { file: route.component }
    });
  }
}
function validateGetStaticPathsResult(result, route) {
  if (!Array.isArray(result)) {
    throw new AstroError({
      ...InvalidGetStaticPathsReturn,
      message: InvalidGetStaticPathsReturn.message(typeof result),
      location: {
        file: route.component
      }
    });
  }
  result.forEach((pathObject) => {
    if (typeof pathObject === "object" && Array.isArray(pathObject) || pathObject === null) {
      throw new AstroError({
        ...InvalidGetStaticPathsEntry,
        message: InvalidGetStaticPathsEntry.message(
          Array.isArray(pathObject) ? "array" : typeof pathObject
        )
      });
    }
    if (pathObject.params === void 0 || pathObject.params === null || pathObject.params && Object.keys(pathObject.params).length === 0) {
      throw new AstroError({
        ...GetStaticPathsExpectedParams,
        location: {
          file: route.component
        }
      });
    }
  });
}

function generatePaginateFunction(routeMatch, base, trailingSlash) {
  return function paginateUtility(data, args = {}) {
    const generate = getRouteGenerator(routeMatch.segments, trailingSlash);
    let { pageSize: _pageSize, params: _params, props: _props } = args;
    const pageSize = _pageSize || 10;
    const paramName = "page";
    const additionalParams = _params || {};
    const additionalProps = _props || {};
    let includesFirstPageNumber;
    if (routeMatch.params.includes(`...${paramName}`)) {
      includesFirstPageNumber = false;
    } else if (routeMatch.params.includes(`${paramName}`)) {
      includesFirstPageNumber = true;
    } else {
      throw new AstroError({
        ...PageNumberParamNotFound,
        message: PageNumberParamNotFound.message(paramName)
      });
    }
    const lastPage = Math.max(1, Math.ceil(data.length / pageSize));
    const result = [...Array(lastPage).keys()].map((num) => {
      const pageNum = num + 1;
      const start = pageSize === Number.POSITIVE_INFINITY ? 0 : (pageNum - 1) * pageSize;
      const end = Math.min(start + pageSize, data.length);
      const params = {
        ...additionalParams,
        [paramName]: includesFirstPageNumber || pageNum > 1 ? String(pageNum) : void 0
      };
      const current = addRouteBase(generate({ ...params }), base);
      const next = pageNum === lastPage ? void 0 : addRouteBase(generate({ ...params, page: String(pageNum + 1) }), base);
      const prev = pageNum === 1 ? void 0 : addRouteBase(
        generate({
          ...params,
          page: !includesFirstPageNumber && pageNum - 1 === 1 ? void 0 : String(pageNum - 1)
        }),
        base
      );
      const first = pageNum === 1 ? void 0 : addRouteBase(
        generate({
          ...params,
          page: includesFirstPageNumber ? "1" : void 0
        }),
        base
      );
      const last = pageNum === lastPage ? void 0 : addRouteBase(generate({ ...params, page: String(lastPage) }), base);
      return {
        params,
        props: {
          ...additionalProps,
          page: {
            data: data.slice(start, end),
            start,
            end: end - 1,
            size: pageSize,
            total: data.length,
            currentPage: pageNum,
            lastPage,
            url: { current, next, prev, first, last }
          }
        }
      };
    });
    return result;
  };
}
function addRouteBase(route, base) {
  let routeWithBase = joinPaths(base, route);
  if (routeWithBase === "") routeWithBase = "/";
  return routeWithBase;
}

async function callGetStaticPaths({
  mod,
  route,
  routeCache,
  ssr,
  base,
  trailingSlash
}) {
  const cached = routeCache.get(route);
  if (!mod) {
    throw new Error("This is an error caused by Astro and not your code. Please file an issue.");
  }
  if (cached?.staticPaths && cached.mod === mod) {
    return cached.staticPaths;
  }
  validateDynamicRouteModule(mod, { ssr, route });
  if (ssr && !route.prerender || route.origin === "internal") {
    const entry = Object.assign([], { keyed: /* @__PURE__ */ new Map() });
    routeCache.set(route, { ...cached, mod, staticPaths: entry });
    return entry;
  }
  let staticPaths = [];
  if (!mod.getStaticPaths) {
    throw new Error("Unexpected Error.");
  }
  staticPaths = await mod.getStaticPaths({
    // Q: Why the cast?
    // A: So users downstream can have nicer typings, we have to make some sacrifice in our internal typings, which necessitate a cast here
    paginate: generatePaginateFunction(route, base, trailingSlash),
    routePattern: route.route
  });
  validateGetStaticPathsResult(staticPaths, route);
  const keyedStaticPaths = staticPaths;
  keyedStaticPaths.keyed = /* @__PURE__ */ new Map();
  for (const sp of keyedStaticPaths) {
    const paramsKey = stringifyParams(sp.params, route, trailingSlash);
    keyedStaticPaths.keyed.set(paramsKey, sp);
  }
  routeCache.set(route, { ...cached, mod, staticPaths: keyedStaticPaths });
  return keyedStaticPaths;
}
class RouteCache {
  logger;
  cache = {};
  runtimeMode;
  constructor(logger, runtimeMode = "production") {
    this.logger = logger;
    this.runtimeMode = runtimeMode;
  }
  /** Clear the cache. */
  clearAll() {
    this.cache = {};
  }
  set(route, entry) {
    const key = this.key(route);
    if (this.runtimeMode === "production" && this.cache[key]?.staticPaths) {
      this.logger.warn(null, `Internal Warning: route cache overwritten. (${key})`);
    }
    this.cache[key] = entry;
  }
  get(route) {
    return this.cache[this.key(route)];
  }
  key(route) {
    return `${route.route}_${route.component}`;
  }
}
function findPathItemByKey(staticPaths, params, route, logger, trailingSlash) {
  const paramsKey = stringifyParams(params, route, trailingSlash);
  const matchedStaticPath = staticPaths.keyed.get(paramsKey);
  if (matchedStaticPath) {
    return matchedStaticPath;
  }
  logger.debug("router", `findPathItemByKey() - Unexpected cache miss looking for ${paramsKey}`);
}

async function renderEndpoint(mod, context, isPrerendered, logger) {
  const { request, url } = context;
  const method = request.method.toUpperCase();
  let handler = mod[method] ?? mod["ALL"];
  if (!handler && method === "HEAD" && mod["GET"]) {
    handler = mod["GET"];
  }
  if (isPrerendered && !["GET", "HEAD"].includes(method)) {
    logger.warn(
      "router",
      `${url.pathname} ${colors.bold(
        method
      )} requests are not available in static endpoints. Mark this page as server-rendered (\`export const prerender = false;\`) or update your config to \`output: 'server'\` to make all your pages server-rendered by default.`
    );
  }
  if (handler === void 0) {
    logger.warn(
      "router",
      `No API Route handler exists for the method "${method}" for the route "${url.pathname}".
Found handlers: ${Object.keys(mod).map((exp) => JSON.stringify(exp)).join(", ")}
` + ("all" in mod ? `One of the exported handlers is "all" (lowercase), did you mean to export 'ALL'?
` : "")
    );
    return new Response(null, { status: 404 });
  }
  if (typeof handler !== "function") {
    logger.error(
      "router",
      `The route "${url.pathname}" exports a value for the method "${method}", but it is of the type ${typeof handler} instead of a function.`
    );
    return new Response(null, { status: 500 });
  }
  let response = await handler.call(mod, context);
  if (!response || response instanceof Response === false) {
    throw new AstroError(EndpointDidNotReturnAResponse);
  }
  if (REROUTABLE_STATUS_CODES.includes(response.status)) {
    try {
      response.headers.set(REROUTE_DIRECTIVE_HEADER, "no");
    } catch (err) {
      if (err.message?.includes("immutable")) {
        response = new Response(response.body, response);
        response.headers.set(REROUTE_DIRECTIVE_HEADER, "no");
      } else {
        throw err;
      }
    }
  }
  if (method === "HEAD") {
    return new Response(null, response);
  }
  return response;
}

function isPromise(value) {
  return !!value && typeof value === "object" && "then" in value && typeof value.then === "function";
}
async function* streamAsyncIterator(stream) {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

const escapeHTML = escape;
function stringifyForScript(value) {
  return JSON.stringify(value)?.replace(/</g, "\\u003c");
}
class HTMLBytes extends Uint8Array {
}
Object.defineProperty(HTMLBytes.prototype, Symbol.toStringTag, {
  get() {
    return "HTMLBytes";
  }
});
const htmlStringSymbol = /* @__PURE__ */ Symbol.for("astro:html-string");
class HTMLString extends String {
  [htmlStringSymbol] = true;
}
const markHTMLString = (value) => {
  if (isHTMLString(value)) {
    return value;
  }
  if (typeof value === "string") {
    return new HTMLString(value);
  }
  return value;
};
function isHTMLString(value) {
  return !!value?.[htmlStringSymbol];
}
function markHTMLBytes(bytes) {
  return new HTMLBytes(bytes);
}
function hasGetReader(obj) {
  return typeof obj.getReader === "function";
}
async function* unescapeChunksAsync(iterable) {
  if (hasGetReader(iterable)) {
    for await (const chunk of streamAsyncIterator(iterable)) {
      yield unescapeHTML(chunk);
    }
  } else {
    for await (const chunk of iterable) {
      yield unescapeHTML(chunk);
    }
  }
}
function* unescapeChunks(iterable) {
  for (const chunk of iterable) {
    yield unescapeHTML(chunk);
  }
}
function unescapeHTML(str) {
  if (!!str && typeof str === "object") {
    if (str instanceof Uint8Array) {
      return markHTMLBytes(str);
    } else if (str instanceof Response && str.body) {
      const body = str.body;
      return unescapeChunksAsync(body);
    } else if (typeof str.then === "function") {
      return Promise.resolve(str).then((value) => {
        return unescapeHTML(value);
      });
    } else if (str[/* @__PURE__ */ Symbol.for("astro:slot-string")]) {
      return str;
    } else if (Symbol.iterator in str) {
      return unescapeChunks(str);
    } else if (Symbol.asyncIterator in str || hasGetReader(str)) {
      return unescapeChunksAsync(str);
    }
  }
  return markHTMLString(str);
}

const AstroJSX = "astro:jsx";
function isVNode(vnode) {
  return vnode && typeof vnode === "object" && vnode[AstroJSX];
}

function resolvePropagationHint(input) {
  const explicitHint = input.factoryHint ?? "none";
  if (explicitHint !== "none") {
    return explicitHint;
  }
  if (!input.moduleId) {
    return "none";
  }
  return input.metadataLookup(input.moduleId) ?? "none";
}
function isPropagatingHint(hint) {
  return hint === "self" || hint === "in-tree";
}
function getPropagationHint$1(result, factory) {
  return resolvePropagationHint({
    factoryHint: factory.propagation,
    moduleId: factory.moduleId,
    metadataLookup: (moduleId) => result.componentMetadata.get(moduleId)?.propagation
  });
}

function isAstroComponentFactory(obj) {
  return obj == null ? false : obj.isAstroComponentFactory === true;
}
function isAPropagatingComponent(result, factory) {
  return isPropagatingHint(getPropagationHint(result, factory));
}
function getPropagationHint(result, factory) {
  return getPropagationHint$1(result, factory);
}

const PROP_TYPE = {
  Value: 0,
  JSON: 1,
  // Actually means Array
  RegExp: 2,
  Date: 3,
  Map: 4,
  Set: 5,
  BigInt: 6,
  URL: 7,
  Uint8Array: 8,
  Uint16Array: 9,
  Uint32Array: 10,
  Infinity: 11
};
function serializeArray(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  if (parents.has(value)) {
    throw new Error(`Cyclic reference detected while serializing props for <${metadata.displayName} client:${metadata.hydrate}>!

Cyclic references cannot be safely serialized for client-side usage. Please remove the cyclic reference.`);
  }
  parents.add(value);
  const serialized = value.map((v) => {
    return convertToSerializedForm(v, metadata, parents);
  });
  parents.delete(value);
  return serialized;
}
function serializeObject(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  if (parents.has(value)) {
    throw new Error(`Cyclic reference detected while serializing props for <${metadata.displayName} client:${metadata.hydrate}>!

Cyclic references cannot be safely serialized for client-side usage. Please remove the cyclic reference.`);
  }
  parents.add(value);
  const serialized = Object.fromEntries(
    Object.entries(value).map(([k, v]) => {
      return [k, convertToSerializedForm(v, metadata, parents)];
    })
  );
  parents.delete(value);
  return serialized;
}
function convertToSerializedForm(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  const tag = Object.prototype.toString.call(value);
  switch (tag) {
    case "[object Date]": {
      return [PROP_TYPE.Date, value.toISOString()];
    }
    case "[object RegExp]": {
      return [PROP_TYPE.RegExp, value.source];
    }
    case "[object Map]": {
      return [PROP_TYPE.Map, serializeArray(Array.from(value), metadata, parents)];
    }
    case "[object Set]": {
      return [PROP_TYPE.Set, serializeArray(Array.from(value), metadata, parents)];
    }
    case "[object BigInt]": {
      return [PROP_TYPE.BigInt, value.toString()];
    }
    case "[object URL]": {
      return [PROP_TYPE.URL, value.toString()];
    }
    case "[object Array]": {
      return [PROP_TYPE.JSON, serializeArray(value, metadata, parents)];
    }
    case "[object Uint8Array]": {
      return [PROP_TYPE.Uint8Array, Array.from(value)];
    }
    case "[object Uint16Array]": {
      return [PROP_TYPE.Uint16Array, Array.from(value)];
    }
    case "[object Uint32Array]": {
      return [PROP_TYPE.Uint32Array, Array.from(value)];
    }
    default: {
      if (value !== null && typeof value === "object") {
        return [PROP_TYPE.Value, serializeObject(value, metadata, parents)];
      }
      if (value === Number.POSITIVE_INFINITY) {
        return [PROP_TYPE.Infinity, 1];
      }
      if (value === Number.NEGATIVE_INFINITY) {
        return [PROP_TYPE.Infinity, -1];
      }
      if (value === void 0) {
        return [PROP_TYPE.Value];
      }
      return [PROP_TYPE.Value, value];
    }
  }
}
function serializeProps(props, metadata) {
  const serialized = JSON.stringify(serializeObject(props, metadata));
  return serialized;
}

const transitionDirectivesToCopyOnIsland = Object.freeze([
  "data-astro-transition-scope",
  "data-astro-transition-persist",
  "data-astro-transition-persist-props"
]);
function extractDirectives(inputProps, clientDirectives) {
  let extracted = {
    isPage: false,
    hydration: null,
    props: {},
    propsWithoutTransitionAttributes: {}
  };
  for (const [key, value] of Object.entries(inputProps)) {
    if (key.startsWith("server:")) {
      if (key === "server:root") {
        extracted.isPage = true;
      }
    }
    if (key.startsWith("client:")) {
      if (!extracted.hydration) {
        extracted.hydration = {
          directive: "",
          value: "",
          componentUrl: "",
          componentExport: { value: "" }
        };
      }
      switch (key) {
        case "client:component-path": {
          extracted.hydration.componentUrl = value;
          break;
        }
        case "client:component-export": {
          extracted.hydration.componentExport.value = value;
          break;
        }
        // This is a special prop added to prove that the client hydration method
        // was added statically.
        case "client:component-hydration": {
          break;
        }
        case "client:display-name": {
          break;
        }
        default: {
          extracted.hydration.directive = key.split(":")[1];
          extracted.hydration.value = value;
          if (!clientDirectives.has(extracted.hydration.directive)) {
            const hydrationMethods = Array.from(clientDirectives.keys()).map((d) => `client:${d}`).join(", ");
            throw new Error(
              `Error: invalid hydration directive "${key}". Supported hydration methods: ${hydrationMethods}`
            );
          }
          if (extracted.hydration.directive === "media" && typeof extracted.hydration.value !== "string") {
            throw new AstroError(MissingMediaQueryDirective);
          }
          break;
        }
      }
    } else {
      extracted.props[key] = value;
      if (!transitionDirectivesToCopyOnIsland.includes(key)) {
        extracted.propsWithoutTransitionAttributes[key] = value;
      }
    }
  }
  for (const sym of Object.getOwnPropertySymbols(inputProps)) {
    extracted.props[sym] = inputProps[sym];
    extracted.propsWithoutTransitionAttributes[sym] = inputProps[sym];
  }
  return extracted;
}
async function generateHydrateScript(scriptOptions, metadata) {
  const { renderer, result, astroId, props, attrs } = scriptOptions;
  const { hydrate, componentUrl, componentExport } = metadata;
  if (!componentExport.value) {
    throw new AstroError({
      ...NoMatchingImport,
      message: NoMatchingImport.message(metadata.displayName)
    });
  }
  const island = {
    children: "",
    props: {
      // This is for HMR, probably can avoid it in prod
      uid: astroId
    }
  };
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      island.props[key] = escapeHTML(value);
    }
  }
  island.props["component-url"] = await result.resolve(decodeURI(componentUrl));
  if (renderer.clientEntrypoint) {
    island.props["component-export"] = componentExport.value;
    island.props["renderer-url"] = await result.resolve(
      decodeURI(renderer.clientEntrypoint.toString())
    );
    island.props["props"] = escapeHTML(serializeProps(props, metadata));
  }
  island.props["ssr"] = "";
  island.props["client"] = hydrate;
  let beforeHydrationUrl = await result.resolve("astro:scripts/before-hydration.js");
  if (beforeHydrationUrl.length) {
    island.props["before-hydration-url"] = beforeHydrationUrl;
  }
  island.props["opts"] = escapeHTML(
    JSON.stringify({
      name: metadata.displayName,
      value: metadata.hydrateArgs || ""
    })
  );
  transitionDirectivesToCopyOnIsland.forEach((name) => {
    if (typeof props[name] !== "undefined") {
      island.props[name] = props[name];
    }
  });
  return island;
}

/**
 * shortdash - https://github.com/bibig/node-shorthash
 *
 * @license
 *
 * (The MIT License)
 *
 * Copyright (c) 2013 Bibig <bibig@me.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
const dictionary = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY";
const binary = dictionary.length;
function bitwise(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash = hash & hash;
  }
  return hash;
}
function shorthash(text) {
  let num;
  let result = "";
  let integer = bitwise(text);
  const sign = integer < 0 ? "Z" : "";
  integer = Math.abs(integer);
  while (integer >= binary) {
    num = integer % binary;
    integer = Math.floor(integer / binary);
    result = dictionary[num] + result;
  }
  if (integer > 0) {
    result = dictionary[integer] + result;
  }
  return sign + result;
}

const headAndContentSym = /* @__PURE__ */ Symbol.for("astro.headAndContent");
function isHeadAndContent(obj) {
  return typeof obj === "object" && obj !== null && !!obj[headAndContentSym];
}
function createThinHead() {
  return {
    [headAndContentSym]: true
  };
}

var astro_island_prebuilt_default = `(()=>{var g=Object.defineProperty;var w=(c,s,d)=>s in c?g(c,s,{enumerable:!0,configurable:!0,writable:!0,value:d}):c[s]=d;var l=(c,s,d)=>w(c,typeof s!="symbol"?s+"":s,d);var E=new Set(["__proto__","constructor","prototype"]);{let c={0:t=>y(t),1:t=>d(t),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(d(t)),5:t=>new Set(d(t)),6:t=>BigInt(t),7:t=>new URL(t),8:t=>new Uint8Array(t),9:t=>new Uint16Array(t),10:t=>new Uint32Array(t),11:t=>Number.POSITIVE_INFINITY*t},s=t=>{let[p,e]=t;return p in c?c[p](e):void 0},d=t=>t.map(s),y=t=>typeof t!="object"||t===null?t:Object.fromEntries(Object.entries(t).map(([p,e])=>[p,s(e)]));class f extends HTMLElement{constructor(){super(...arguments);l(this,"Component");l(this,"hydrator");l(this,"hydrate",async()=>{var b;if(!this.hydrator||!this.isConnected)return;let e=(b=this.parentElement)==null?void 0:b.closest("astro-island[ssr]");if(e){e.addEventListener("astro:hydrate",this.hydrate,{once:!0});return}let n=this.querySelectorAll("astro-slot"),r={},i=this.querySelectorAll("template[data-astro-template]");for(let o of i){let a=o.closest(this.tagName);a!=null&&a.isSameNode(this)&&(r[o.getAttribute("data-astro-template")||"default"]=o.innerHTML,o.remove())}for(let o of n){let a=o.closest(this.tagName);a!=null&&a.isSameNode(this)&&(r[o.getAttribute("name")||"default"]=o.innerHTML)}let u;try{u=this.hasAttribute("props")?y(JSON.parse(this.getAttribute("props"))):{}}catch(o){let a=this.getAttribute("component-url")||"<unknown>",v=this.getAttribute("component-export");throw v&&(a+=\` (export \${v})\`),console.error(\`[hydrate] Error parsing props for component \${a}\`,this.getAttribute("props"),o),o}let h;await this.hydrator(this)(this.Component,u,r,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),this.dispatchEvent(new CustomEvent("astro:hydrate"))});l(this,"unmount",()=>{this.isConnected||this.dispatchEvent(new CustomEvent("astro:unmount"))})}disconnectedCallback(){document.removeEventListener("astro:after-swap",this.unmount),document.addEventListener("astro:after-swap",this.unmount,{once:!0})}connectedCallback(){if(!this.hasAttribute("await-children")||document.readyState==="interactive"||document.readyState==="complete")this.childrenConnectedCallback();else{let e=()=>{document.removeEventListener("DOMContentLoaded",e),n.disconnect(),this.childrenConnectedCallback()},n=new MutationObserver(()=>{var r;((r=this.lastChild)==null?void 0:r.nodeType)===Node.COMMENT_NODE&&this.lastChild.nodeValue==="astro:end"&&(this.lastChild.remove(),e())});n.observe(this,{childList:!0}),document.addEventListener("DOMContentLoaded",e)}}async childrenConnectedCallback(){let e=this.getAttribute("before-hydration-url");e&&await import(e),this.start()}getRetryImportUrl(e){let n=new URL(e,document.baseURI),r=\`astro-retry=\${Date.now()}\`,i=n.hash.replace(/^#/,"");return n.hash=i?\`\${i}&\${r}\`:r,n.toString()}async importWithRetry(e){try{return await import(e)}catch(n){return await new Promise(r=>setTimeout(r,1e3)),import(this.getRetryImportUrl(e))}}handleHydrationError(e){let n=this.getAttribute("component-url"),r=new CustomEvent("astro:hydration-error",{cancelable:!0,bubbles:!0,composed:!0,detail:{error:e,componentUrl:n}});this.dispatchEvent(r)&&console.error(\`[astro-island] Error hydrating \${n}\`,e)}async start(){let e=JSON.parse(this.getAttribute("opts")),n=this.getAttribute("client");if(Astro[n]===void 0){window.addEventListener(\`astro:\${n}\`,()=>this.start(),{once:!0});return}try{await Astro[n](async()=>{let r=this.getAttribute("renderer-url");try{let[i,{default:u}]=await Promise.all([this.importWithRetry(this.getAttribute("component-url")),r?this.importWithRetry(r):Promise.resolve({default:()=>()=>{}})]),h=this.getAttribute("component-export")||"default";if(h.includes(".")){this.Component=i;for(let m of h.split(".")){if(E.has(m)||!this.Component||typeof this.Component!="object"&&typeof this.Component!="function"||!Object.hasOwn(this.Component,m))throw new Error(\`Invalid component export path: \${h}\`);this.Component=this.Component[m]}}else{if(E.has(h))throw new Error(\`Invalid component export path: \${h}\`);this.Component=i[h]}return this.hydrator=u,this.hydrate}catch(i){return this.handleHydrationError(i),()=>{}}},e,this)}catch(r){this.handleHydrationError(r)}}attributeChangedCallback(){this.hydrate()}}l(f,"observedAttributes",["props"]),customElements.get("astro-island")||customElements.define("astro-island",f)}})();`;

var astro_island_prebuilt_dev_default = `(()=>{var g=Object.defineProperty;var w=(d,s,h)=>s in d?g(d,s,{enumerable:!0,configurable:!0,writable:!0,value:h}):d[s]=h;var l=(d,s,h)=>w(d,typeof s!="symbol"?s+"":s,h);var E=new Set(["__proto__","constructor","prototype"]);{let d={0:t=>y(t),1:t=>h(t),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(h(t)),5:t=>new Set(h(t)),6:t=>BigInt(t),7:t=>new URL(t),8:t=>new Uint8Array(t),9:t=>new Uint16Array(t),10:t=>new Uint32Array(t),11:t=>Number.POSITIVE_INFINITY*t},s=t=>{let[p,e]=t;return p in d?d[p](e):void 0},h=t=>t.map(s),y=t=>typeof t!="object"||t===null?t:Object.fromEntries(Object.entries(t).map(([p,e])=>[p,s(e)]));class f extends HTMLElement{constructor(){super(...arguments);l(this,"Component");l(this,"hydrator");l(this,"hydrate",async()=>{var b;if(!this.hydrator||!this.isConnected)return;let e=(b=this.parentElement)==null?void 0:b.closest("astro-island[ssr]");if(e){e.addEventListener("astro:hydrate",this.hydrate,{once:!0});return}let n=this.querySelectorAll("astro-slot"),r={},i=this.querySelectorAll("template[data-astro-template]");for(let o of i){let c=o.closest(this.tagName);c!=null&&c.isSameNode(this)&&(r[o.getAttribute("data-astro-template")||"default"]=o.innerHTML,o.remove())}for(let o of n){let c=o.closest(this.tagName);c!=null&&c.isSameNode(this)&&(r[o.getAttribute("name")||"default"]=o.innerHTML)}let m;try{m=this.hasAttribute("props")?y(JSON.parse(this.getAttribute("props"))):{}}catch(o){let c=this.getAttribute("component-url")||"<unknown>",v=this.getAttribute("component-export");throw v&&(c+=\` (export \${v})\`),console.error(\`[hydrate] Error parsing props for component \${c}\`,this.getAttribute("props"),o),o}let a,u=this.hydrator(this);a=performance.now(),await u(this.Component,m,r,{client:this.getAttribute("client")}),a&&this.setAttribute("client-render-time",(performance.now()-a).toString()),this.removeAttribute("ssr"),this.dispatchEvent(new CustomEvent("astro:hydrate"))});l(this,"unmount",()=>{this.isConnected||this.dispatchEvent(new CustomEvent("astro:unmount"))})}disconnectedCallback(){document.removeEventListener("astro:after-swap",this.unmount),document.addEventListener("astro:after-swap",this.unmount,{once:!0})}connectedCallback(){if(!this.hasAttribute("await-children")||document.readyState==="interactive"||document.readyState==="complete")this.childrenConnectedCallback();else{let e=()=>{document.removeEventListener("DOMContentLoaded",e),n.disconnect(),this.childrenConnectedCallback()},n=new MutationObserver(()=>{var r;((r=this.lastChild)==null?void 0:r.nodeType)===Node.COMMENT_NODE&&this.lastChild.nodeValue==="astro:end"&&(this.lastChild.remove(),e())});n.observe(this,{childList:!0}),document.addEventListener("DOMContentLoaded",e)}}async childrenConnectedCallback(){let e=this.getAttribute("before-hydration-url");e&&await import(e),this.start()}getRetryImportUrl(e){let n=new URL(e,document.baseURI),r=\`astro-retry=\${Date.now()}\`,i=n.hash.replace(/^#/,"");return n.hash=i?\`\${i}&\${r}\`:r,n.toString()}async importWithRetry(e){try{return await import(e)}catch(n){return await new Promise(r=>setTimeout(r,1e3)),import(this.getRetryImportUrl(e))}}handleHydrationError(e){let n=this.getAttribute("component-url"),r=new CustomEvent("astro:hydration-error",{cancelable:!0,bubbles:!0,composed:!0,detail:{error:e,componentUrl:n}});this.dispatchEvent(r)&&console.error(\`[astro-island] Error hydrating \${n}\`,e)}async start(){let e=JSON.parse(this.getAttribute("opts")),n=this.getAttribute("client");if(Astro[n]===void 0){window.addEventListener(\`astro:\${n}\`,()=>this.start(),{once:!0});return}try{await Astro[n](async()=>{let r=this.getAttribute("renderer-url");try{let[i,{default:m}]=await Promise.all([this.importWithRetry(this.getAttribute("component-url")),r?this.importWithRetry(r):Promise.resolve({default:()=>()=>{}})]),a=this.getAttribute("component-export")||"default";if(a.includes(".")){this.Component=i;for(let u of a.split(".")){if(E.has(u)||!this.Component||typeof this.Component!="object"&&typeof this.Component!="function"||!Object.hasOwn(this.Component,u))throw new Error(\`Invalid component export path: \${a}\`);this.Component=this.Component[u]}}else{if(E.has(a))throw new Error(\`Invalid component export path: \${a}\`);this.Component=i[a]}return this.hydrator=m,this.hydrate}catch(i){return this.handleHydrationError(i),()=>{}}},e,this)}catch(r){this.handleHydrationError(r)}}attributeChangedCallback(){this.hydrate()}}l(f,"observedAttributes",["props"]),customElements.get("astro-island")||customElements.define("astro-island",f)}})();`;

const ISLAND_STYLES = "astro-island,astro-slot,astro-static-slot{display:contents}";

function determineIfNeedsHydrationScript(result) {
  if (result._metadata.templateDepth > 0) {
    return !result._metadata.hasHydrationScript;
  }
  if (result._metadata.hasHydrationScript) {
    return false;
  }
  return result._metadata.hasHydrationScript = true;
}
function determinesIfNeedsDirectiveScript(result, directive) {
  if (result._metadata.templateDepth > 0) {
    return !result._metadata.hasDirectives.has(directive);
  }
  if (result._metadata.hasDirectives.has(directive)) {
    return false;
  }
  result._metadata.hasDirectives.add(directive);
  return true;
}
function getDirectiveScriptText(result, directive) {
  const clientDirectives = result.clientDirectives;
  const clientDirective = clientDirectives.get(directive);
  if (!clientDirective) {
    throw new Error(`Unknown directive: ${directive}`);
  }
  return clientDirective;
}
function getPrescripts(result, type, directive) {
  switch (type) {
    case "both":
      return `<style>${ISLAND_STYLES}</style><script>${getDirectiveScriptText(result, directive)}</script><script>${process.env.NODE_ENV === "development" ? astro_island_prebuilt_dev_default : astro_island_prebuilt_default}</script>`;
    case "directive":
      return `<script>${getDirectiveScriptText(result, directive)}</script>`;
  }
}

async function collectPropagatedHeadParts(input) {
  const collectedHeadParts = [];
  const iterator = input.propagators.values();
  while (true) {
    const { value, done } = iterator.next();
    if (done) {
      break;
    }
    const returnValue = await value.init(input.result);
    if (input.isHeadAndContent(returnValue) && returnValue.head) {
      collectedHeadParts.push(returnValue.head);
    }
  }
  return collectedHeadParts;
}

function shouldRenderHeadInstruction(state) {
  return !state.hasRenderedHead && !state.partial;
}
function shouldRenderMaybeHeadInstruction(state) {
  return !state.hasRenderedHead && !state.headInTree && !state.partial;
}
function shouldRenderInstruction$1(type, state) {
  return type === "head" ? shouldRenderHeadInstruction(state) : shouldRenderMaybeHeadInstruction(state);
}

function registerIfPropagating(result, factory, instance) {
  if (factory.propagation === "self" || factory.propagation === "in-tree") {
    result._metadata.propagators.add(
      instance
    );
    return;
  }
  if (factory.moduleId) {
    const hint = result.componentMetadata.get(factory.moduleId)?.propagation;
    if (isPropagatingHint(hint ?? "none")) {
      result._metadata.propagators.add(
        instance
      );
    }
  }
}
async function bufferPropagatedHead(result) {
  const collected = await collectPropagatedHeadParts({
    propagators: result._metadata.propagators,
    result,
    isHeadAndContent
  });
  result._metadata.extraHead.push(...collected);
}
function shouldRenderInstruction(type, state) {
  return shouldRenderInstruction$1(type, state);
}
function getInstructionRenderState(result) {
  return {
    hasRenderedHead: result._metadata.hasRenderedHead,
    headInTree: result._metadata.headInTree,
    partial: result.partial
  };
}

function renderCspContent(result) {
  const finalScriptHashes = /* @__PURE__ */ new Set();
  const finalStyleHashes = /* @__PURE__ */ new Set();
  for (const scriptHash of result.scriptHashes) {
    finalScriptHashes.add(`'${scriptHash}'`);
  }
  for (const styleHash of result.styleHashes) {
    finalStyleHashes.add(`'${styleHash}'`);
  }
  for (const styleHash of result._metadata.extraStyleHashes) {
    finalStyleHashes.add(`'${styleHash}'`);
  }
  for (const scriptHash of result._metadata.extraScriptHashes) {
    finalScriptHashes.add(`'${scriptHash}'`);
  }
  let directives;
  if (result.directives.length > 0) {
    directives = result.directives.join(";") + ";";
  }
  let scriptResources = "'self'";
  if (result.scriptResources.length > 0) {
    scriptResources = result.scriptResources.map((r) => `${r}`).join(" ");
  }
  let styleResources = "'self'";
  if (result.styleResources.length > 0) {
    styleResources = result.styleResources.map((r) => `${r}`).join(" ");
  }
  const strictDynamic = result.isStrictDynamic ? ` 'strict-dynamic'` : "";
  const scriptSrc = `script-src ${scriptResources} ${Array.from(finalScriptHashes).join(" ")}${strictDynamic};`;
  const styleSrc = `style-src ${styleResources} ${Array.from(finalStyleHashes).join(" ")};`;
  return [directives, scriptSrc, styleSrc].filter(Boolean).join(" ");
}

const RenderInstructionSymbol = /* @__PURE__ */ Symbol.for("astro:render");
function createRenderInstruction(instruction) {
  return Object.defineProperty(instruction, RenderInstructionSymbol, {
    value: true
  });
}
function isRenderInstruction(chunk) {
  return chunk && typeof chunk === "object" && chunk[RenderInstructionSymbol];
}

const voidElementNames = /^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;
const htmlBooleanAttributes = /^(?:allowfullscreen|async|autofocus|autoplay|checked|controls|default|defer|disabled|disablepictureinpicture|disableremoteplayback|formnovalidate|inert|loop|muted|nomodule|novalidate|open|playsinline|readonly|required|reversed|scoped|seamless|selected|itemscope)$/i;
const AMPERSAND_REGEX = /&/g;
const DOUBLE_QUOTE_REGEX = /"/g;
const STATIC_DIRECTIVES = /* @__PURE__ */ new Set(["set:html", "set:text"]);
const INVALID_ATTR_NAME_CHAR = /[\s"'>/=]/;
const toIdent = (k) => k.trim().replace(/(?!^)\b\w|\s+|\W+/g, (match, index) => {
  if (/\W/.test(match)) return "";
  return index === 0 ? match : match.toUpperCase();
});
const toAttributeString = (value, shouldEscape = true) => shouldEscape ? String(value).replace(AMPERSAND_REGEX, "&amp;").replace(DOUBLE_QUOTE_REGEX, "&quot;") : value;
const kebab = (k) => k.toLowerCase() === k ? k : k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
const toStyleString = (obj) => Object.entries(obj).filter(([_, v]) => typeof v === "string" && v.trim() || typeof v === "number").map(([k, v]) => {
  if (k[0] !== "-" && k[1] !== "-") return `${kebab(k)}:${v}`;
  return `${k}:${v}`;
}).join(";");
function defineScriptVars(vars) {
  let output = "";
  for (const [key, value] of Object.entries(vars)) {
    output += `const ${toIdent(key)} = ${stringifyForScript(value)};
`;
  }
  return markHTMLString(output);
}
function formatList(values) {
  if (values.length === 1) {
    return values[0];
  }
  return `${values.slice(0, -1).join(", ")} or ${values[values.length - 1]}`;
}
function isCustomElement(tagName) {
  return tagName.includes("-");
}
function handleBooleanAttribute(key, value, shouldEscape, tagName) {
  if (tagName && isCustomElement(tagName)) {
    return markHTMLString(` ${key}="${toAttributeString(value, shouldEscape)}"`);
  }
  return markHTMLString(value ? ` ${key}` : "");
}
function addAttribute(value, key, shouldEscape = true, tagName = "") {
  if (value == null) {
    return "";
  }
  if (INVALID_ATTR_NAME_CHAR.test(key)) {
    return "";
  }
  if (STATIC_DIRECTIVES.has(key)) {
    console.warn(`[astro] The "${key}" directive cannot be applied dynamically at runtime. It will not be rendered as an attribute.

Make sure to use the static attribute syntax (\`${key}={value}\`) instead of the dynamic spread syntax (\`{...{ "${key}": value }}\`).`);
    return "";
  }
  if (key === "class:list") {
    const listValue = toAttributeString(clsx(value), shouldEscape);
    if (listValue === "") {
      return "";
    }
    return markHTMLString(` ${key.slice(0, -5)}="${listValue}"`);
  }
  if (key === "style" && !(value instanceof HTMLString)) {
    if (Array.isArray(value) && value.length === 2) {
      return markHTMLString(
        ` ${key}="${toAttributeString(`${toStyleString(value[0])};${value[1]}`, shouldEscape)}"`
      );
    }
    if (typeof value === "object") {
      return markHTMLString(` ${key}="${toAttributeString(toStyleString(value), shouldEscape)}"`);
    }
  }
  if (key === "className") {
    return markHTMLString(` class="${toAttributeString(value, shouldEscape)}"`);
  }
  if (htmlBooleanAttributes.test(key)) {
    return handleBooleanAttribute(key, value, shouldEscape, tagName);
  }
  if (value === "") {
    return markHTMLString(` ${key}`);
  }
  if (key === "popover" && typeof value === "boolean") {
    return handleBooleanAttribute(key, value, shouldEscape, tagName);
  }
  if (key === "download" && typeof value === "boolean") {
    return handleBooleanAttribute(key, value, shouldEscape, tagName);
  }
  if (key === "hidden" && typeof value === "boolean") {
    return handleBooleanAttribute(key, value, shouldEscape, tagName);
  }
  return markHTMLString(` ${key}="${toAttributeString(value, shouldEscape)}"`);
}
function internalSpreadAttributes(values, shouldEscape = true, tagName) {
  let output = "";
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, shouldEscape, tagName);
  }
  return markHTMLString(output);
}
function renderElement$1(name, { props: _props, children = "" }, shouldEscape = true) {
  const { lang: _, "data-astro-id": astroId, "define:vars": defineVars, ...props } = _props;
  if (defineVars) {
    if (name === "style") {
      delete props["is:global"];
      delete props["is:scoped"];
    }
    if (name === "script") {
      delete props.hoist;
      children = defineScriptVars(defineVars) + "\n" + children;
    }
  }
  if ((children == null || children === "") && voidElementNames.test(name)) {
    return `<${name}${internalSpreadAttributes(props, shouldEscape, name)}>`;
  }
  return `<${name}${internalSpreadAttributes(props, shouldEscape, name)}>${children}</${name}>`;
}
const noop = () => {
};
class BufferedRenderer {
  chunks = [];
  renderPromise;
  destination;
  /**
   * Determines whether buffer has been flushed
   * to the final destination.
   */
  flushed = false;
  constructor(destination, renderFunction) {
    this.destination = destination;
    this.renderPromise = renderFunction(this);
    if (isPromise(this.renderPromise)) {
      Promise.resolve(this.renderPromise).catch(noop);
    }
  }
  write(chunk) {
    if (this.flushed) {
      this.destination.write(chunk);
    } else {
      this.chunks.push(chunk);
    }
  }
  flush() {
    if (this.flushed) {
      throw new Error("The render buffer has already been flushed.");
    }
    this.flushed = true;
    for (const chunk of this.chunks) {
      this.destination.write(chunk);
    }
    return this.renderPromise;
  }
}
function createBufferedRenderer(destination, renderFunction) {
  return new BufferedRenderer(destination, renderFunction);
}
const isNode = typeof process !== "undefined" && Object.prototype.toString.call(process) === "[object process]";
const isDeno = typeof Deno !== "undefined";
function promiseWithResolvers() {
  let resolve, reject;
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return {
    promise,
    resolve,
    reject
  };
}

function stablePropsKey(props) {
  const keys = Object.keys(props).sort();
  let result = "{";
  for (let i = 0; i < keys.length; i++) {
    if (i > 0) result += ",";
    result += JSON.stringify(keys[i]) + ":" + JSON.stringify(props[keys[i]]);
  }
  result += "}";
  return result;
}
function deduplicateElements(elements) {
  if (elements.length <= 1) return elements;
  const seen = /* @__PURE__ */ new Set();
  return elements.filter((item) => {
    const key = stablePropsKey(item.props) + item.children;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function renderAllHeadContent(result) {
  result._metadata.hasRenderedHead = true;
  let content = "";
  if (result.shouldInjectCspMetaTags && result.cspDestination === "meta") {
    content += renderElement$1(
      "meta",
      {
        props: {
          "http-equiv": "content-security-policy",
          content: renderCspContent(result)
        },
        children: ""
      },
      false
    );
  }
  const styles = deduplicateElements(Array.from(result.styles)).map(
    (style) => style.props.rel === "stylesheet" ? renderElement$1("link", style) : renderElement$1("style", style)
  );
  result.styles.clear();
  const scripts = deduplicateElements(Array.from(result.scripts)).map((script) => {
    if (result.userAssetsBase) {
      script.props.src = (result.base === "/" ? "" : result.base) + result.userAssetsBase + script.props.src;
    }
    return renderElement$1("script", script, false);
  });
  const links = deduplicateElements(Array.from(result.links)).map(
    (link) => renderElement$1("link", link, false)
  );
  const sep = result.compressHTML === true || result.compressHTML === "jsx" ? "" : "\n";
  content += styles.join(sep) + links.join(sep) + scripts.join(sep);
  content += result._metadata.extraHead.join("");
  return markHTMLString(content);
}
function renderHead() {
  return createRenderInstruction({ type: "head" });
}
function maybeRenderHead() {
  return createRenderInstruction({ type: "maybe-head" });
}

const ALGORITHMS = {
  "SHA-256": "sha256-",
  "SHA-384": "sha384-",
  "SHA-512": "sha512-"
};
const ALGORITHM_VALUES = Object.values(ALGORITHMS);
z.enum(Object.keys(ALGORITHMS)).optional().default("SHA-256");
z.custom((value) => {
  if (typeof value !== "string") {
    return false;
  }
  return ALGORITHM_VALUES.some((allowedValue) => {
    return value.startsWith(allowedValue);
  });
});
const ALLOWED_DIRECTIVES = [
  "base-uri",
  "child-src",
  "connect-src",
  "default-src",
  "fenced-frame-src",
  "font-src",
  "form-action",
  "frame-ancestors",
  "frame-src",
  "img-src",
  "manifest-src",
  "media-src",
  "object-src",
  "referrer",
  "report-to",
  "report-uri",
  "require-trusted-types-for",
  "sandbox",
  "trusted-types",
  "upgrade-insecure-requests",
  "worker-src"
];
z.custom((v) => typeof v === "string").superRefine((value, ctx) => {
  const isAllowed = ALLOWED_DIRECTIVES.some((allowedValue) => {
    return value.startsWith(allowedValue);
  });
  if (!isAllowed) {
    if (value.startsWith("script-src") || value.startsWith("style-src")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Directives \`script-src\` and \`style-src\` are not allowed in \`security.csp.directives\`. Please use \`security.csp.scriptDirective\` and \`security.csp.styleDirective\` instead.`,
        fatal: true
      });
    } else {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid directive: "${value}". Allowed directives are: ${ALLOWED_DIRECTIVES.join(", ")}`,
        fatal: true
      });
    }
  }
});

const ALGORITHM = "AES-GCM";
async function decodeKey(encoded) {
  const bytes = decodeBase64(encoded);
  return crypto.subtle.importKey("raw", bytes.buffer, ALGORITHM, true, [
    "encrypt",
    "decrypt"
  ]);
}
const encoder$1 = new TextEncoder();
const decoder$1 = new TextDecoder();
const IV_LENGTH = 24;
async function encryptString(key, raw, additionalData) {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH / 2));
  const data = encoder$1.encode(raw);
  const params = { name: ALGORITHM, iv };
  if (additionalData) {
    params.additionalData = encoder$1.encode(additionalData);
  }
  const buffer = await crypto.subtle.encrypt(params, key, data);
  return encodeHexUpperCase(iv) + encodeBase64(new Uint8Array(buffer));
}
async function decryptString(key, encoded, additionalData) {
  const iv = decodeHex(encoded.slice(0, IV_LENGTH));
  const dataArray = decodeBase64(encoded.slice(IV_LENGTH));
  const params = { name: ALGORITHM, iv };
  if (additionalData) {
    params.additionalData = encoder$1.encode(additionalData);
  }
  const decryptedBuffer = await crypto.subtle.decrypt(params, key, dataArray);
  const decryptedString = decoder$1.decode(decryptedBuffer);
  return decryptedString;
}
async function generateCspDigest(data, algorithm) {
  const hashBuffer = await crypto.subtle.digest(algorithm, encoder$1.encode(data));
  const hash = encodeBase64(new Uint8Array(hashBuffer));
  return `${ALGORITHMS[algorithm]}${hash}`;
}

const renderTemplateResultSym = /* @__PURE__ */ Symbol.for("astro.renderTemplateResult");
class RenderTemplateResult {
  [renderTemplateResultSym] = true;
  htmlParts;
  expressions;
  error;
  constructor(htmlParts, expressions) {
    this.htmlParts = htmlParts;
    this.error = void 0;
    this.expressions = expressions.map((expression) => {
      if (isPromise(expression)) {
        return Promise.resolve(expression).catch((err) => {
          if (!this.error) {
            this.error = err;
            throw err;
          }
        });
      }
      return expression;
    });
  }
  render(destination) {
    const { htmlParts, expressions } = this;
    for (let i = 0; i < htmlParts.length; i++) {
      const html = htmlParts[i];
      if (html) {
        destination.write(markHTMLString(html));
      }
      if (i >= expressions.length) break;
      const exp = expressions[i];
      if (!(exp || exp === 0)) continue;
      const result = renderChild(destination, exp);
      if (isPromise(result)) {
        const startIdx = i + 1;
        const remaining = expressions.length - startIdx;
        const flushers = new Array(remaining);
        for (let j = 0; j < remaining; j++) {
          const rExp = expressions[startIdx + j];
          flushers[j] = createBufferedRenderer(destination, (bufferDestination) => {
            if (rExp || rExp === 0) {
              return renderChild(bufferDestination, rExp);
            }
          });
        }
        return result.then(() => {
          let k = 0;
          const iterate = () => {
            while (k < flushers.length) {
              const rHtml = htmlParts[startIdx + k];
              if (rHtml) {
                destination.write(markHTMLString(rHtml));
              }
              const flushResult = flushers[k++].flush();
              if (isPromise(flushResult)) {
                return flushResult.then(iterate);
              }
            }
            const lastHtml = htmlParts[htmlParts.length - 1];
            if (lastHtml) {
              destination.write(markHTMLString(lastHtml));
            }
          };
          return iterate();
        });
      }
    }
  }
}
function isRenderTemplateResult(obj) {
  return typeof obj === "object" && obj !== null && !!obj[renderTemplateResultSym];
}
function renderTemplate(htmlParts, ...expressions) {
  return new RenderTemplateResult(htmlParts, expressions);
}

const slotString = /* @__PURE__ */ Symbol.for("astro:slot-string");
class SlotString extends HTMLString {
  instructions;
  [slotString];
  constructor(content, instructions) {
    super(content);
    this.instructions = instructions;
    this[slotString] = true;
  }
}
function isSlotString(str) {
  return !!str[slotString];
}
function mergeSlotInstructions(target, source) {
  if (source.instructions?.length) {
    target ??= [];
    target.push(...source.instructions);
  }
  return target;
}
function renderSlot(result, slotted, fallback) {
  if (!slotted && fallback) {
    return renderSlot(result, fallback);
  }
  return {
    async render(destination) {
      await renderChild(destination, typeof slotted === "function" ? slotted(result) : slotted);
    }
  };
}
async function renderSlotToString(result, slotted, fallback) {
  let content = "";
  let instructions = null;
  const temporaryDestination = {
    write(chunk) {
      if (chunk instanceof SlotString) {
        content += chunk;
        instructions = mergeSlotInstructions(instructions, chunk);
      } else if (chunk instanceof Response) return;
      else if (typeof chunk === "object" && "type" in chunk && typeof chunk.type === "string") {
        if (instructions === null) {
          instructions = [];
        }
        instructions.push(chunk);
      } else {
        content += chunkToString(result, chunk);
      }
    }
  };
  const renderInstance = renderSlot(result, slotted, fallback);
  await renderInstance.render(temporaryDestination);
  return markHTMLString(new SlotString(content, instructions));
}
async function renderSlots(result, slots = {}) {
  let slotInstructions = null;
  let children = {};
  if (slots) {
    await Promise.all(
      Object.entries(slots).map(
        ([key, value]) => renderSlotToString(result, value).then((output) => {
          if (output.instructions) {
            if (slotInstructions === null) {
              slotInstructions = [];
            }
            slotInstructions.push(...output.instructions);
          }
          children[key] = output;
        })
      )
    );
  }
  return { slotInstructions, children };
}
function createSlotValueFromString(content) {
  return function() {
    return renderTemplate`${unescapeHTML(content)}`;
  };
}

const internalProps = /* @__PURE__ */ new Set([
  "server:component-path",
  "server:component-export",
  "server:component-directive",
  "server:defer"
]);
function containsServerDirective(props) {
  return "server:component-directive" in props;
}
function createSearchParams(encryptedComponentExport, encryptedProps, slots) {
  const params = new URLSearchParams();
  params.set("e", encryptedComponentExport);
  params.set("p", encryptedProps);
  params.set("s", slots);
  return params;
}
function isWithinURLLimit(pathname, params) {
  const url = pathname + "?" + params.toString();
  const chars = url.length;
  return chars < 2048;
}
class ServerIslandComponent {
  result;
  props;
  slots;
  displayName;
  hostId;
  islandContent;
  componentPath;
  componentExport;
  componentId;
  constructor(result, props, slots, displayName) {
    this.result = result;
    this.props = props;
    this.slots = slots;
    this.displayName = displayName;
  }
  async init() {
    const content = await this.getIslandContent();
    if (this.result.cspDestination) {
      this.result._metadata.extraScriptHashes.push(
        await generateCspDigest(SERVER_ISLAND_REPLACER, this.result.cspAlgorithm)
      );
      const contentDigest = await generateCspDigest(content, this.result.cspAlgorithm);
      this.result._metadata.extraScriptHashes.push(contentDigest);
    }
    return createThinHead();
  }
  async render(destination) {
    const hostId = await this.getHostId();
    const islandContent = await this.getIslandContent();
    destination.write(createRenderInstruction({ type: "server-island-runtime" }));
    destination.write("<!--[if astro]>server-island-start<![endif]-->");
    for (const name in this.slots) {
      if (name === "fallback") {
        await renderChild(destination, this.slots.fallback(this.result));
      }
    }
    destination.write(
      `<script type="module" data-astro-rerun data-island-id="${hostId}">${islandContent}</script>`
    );
  }
  getComponentPath() {
    if (this.componentPath) {
      return this.componentPath;
    }
    const componentPath = this.props["server:component-path"];
    if (!componentPath) {
      throw new Error(`Could not find server component path`);
    }
    this.componentPath = componentPath;
    return componentPath;
  }
  getComponentExport() {
    if (this.componentExport) {
      return this.componentExport;
    }
    const componentExport = this.props["server:component-export"];
    if (!componentExport) {
      throw new Error(`Could not find server component export`);
    }
    this.componentExport = componentExport;
    return componentExport;
  }
  async getHostId() {
    if (!this.hostId) {
      this.hostId = await crypto.randomUUID();
    }
    return this.hostId;
  }
  async getIslandContent() {
    if (this.islandContent) {
      return this.islandContent;
    }
    const componentPath = this.getComponentPath();
    const componentExport = this.getComponentExport();
    const serverIslandNameMap = await this.result.getServerIslandNameMap();
    let componentId = serverIslandNameMap.get(componentPath);
    if (!componentId) {
      throw new Error(`Could not find server component name ${componentPath}`);
    }
    for (const key2 of Object.keys(this.props)) {
      if (internalProps.has(key2)) {
        delete this.props[key2];
      }
    }
    const renderedSlots = {};
    for (const name in this.slots) {
      if (name !== "fallback") {
        const content = await renderSlotToString(this.result, this.slots[name]);
        let slotHtml = content.toString();
        const slotContent = content;
        if (Array.isArray(slotContent.instructions)) {
          for (const instruction of slotContent.instructions) {
            if (instruction.type === "script") {
              slotHtml += instruction.content;
            }
          }
        }
        renderedSlots[name] = slotHtml;
      }
    }
    const key = await this.result.key;
    const componentExportEncrypted = await encryptString(
      key,
      componentExport,
      `export:${componentId}`
    );
    const propsEncrypted = Object.keys(this.props).length === 0 ? "" : await encryptString(key, JSON.stringify(this.props), `props:${componentId}`);
    const slotsEncrypted = Object.keys(renderedSlots).length === 0 ? "" : await encryptString(key, JSON.stringify(renderedSlots), `slots:${componentId}`);
    const hostId = await this.getHostId();
    const slash = this.result.base.endsWith("/") ? "" : "/";
    let serverIslandUrl = `${this.result.base}${slash}_server-islands/${componentId}${this.result.trailingSlash === "always" ? "/" : ""}`;
    const potentialSearchParams = createSearchParams(
      componentExportEncrypted,
      propsEncrypted,
      slotsEncrypted
    );
    const useGETRequest = isWithinURLLimit(serverIslandUrl, potentialSearchParams);
    if (useGETRequest) {
      serverIslandUrl += "?" + potentialSearchParams.toString();
      this.result._metadata.extraHead.push(
        markHTMLString(
          `<link rel="preload" as="fetch" href="${serverIslandUrl}" crossorigin="anonymous">`
        )
      );
    }
    const adapterHeaders = this.result.internalFetchHeaders || {};
    const headersJson = stringifyForScript(adapterHeaders);
    const method = useGETRequest ? (
      // GET request
      `const headers = new Headers(${headersJson});
let response = await fetch('${serverIslandUrl}', { headers });`
    ) : (
      // POST request
      `let data = {
	encryptedComponentExport: ${stringifyForScript(componentExportEncrypted)},
	encryptedProps: ${stringifyForScript(propsEncrypted)},
	encryptedSlots: ${stringifyForScript(slotsEncrypted)},
};
const headers = new Headers({ 'Content-Type': 'application/json', ...${headersJson} });
let response = await fetch('${serverIslandUrl}', {
	method: 'POST',
	body: JSON.stringify(data),
	headers,
});`
    );
    this.islandContent = `${method}replaceServerIsland('${hostId}', response);`;
    return this.islandContent;
  }
}
const renderServerIslandRuntime = () => {
  return `<script>${SERVER_ISLAND_REPLACER}</script>`;
};
const SERVER_ISLAND_REPLACER = markHTMLString(
  `async function replaceServerIsland(id, r) {
	let s = document.querySelector(\`script[data-island-id="\${id}"]\`);
	// If there's no matching script, or the request fails then return
	if (!s || r.status !== 200 || r.headers.get('content-type')?.split(';')[0].trim() !== 'text/html') return;
	// Load the HTML before modifying the DOM in case of errors
	let html = await r.text();
	// Remove any placeholder content before the island script
	while (s.previousSibling && s.previousSibling.nodeType !== 8 && s.previousSibling.data !== '[if astro]>server-island-start<![endif]')
		s.previousSibling.remove();
	s.previousSibling?.remove();
	// Insert the new HTML
	s.before(document.createRange().createContextualFragment(html));
	// Remove the script. Prior to v5.4.2, this was the trick to force rerun of scripts.  Keeping it to minimize change to the existing behavior.
	s.remove();
}`.split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("//")).join(" ")
);

const Fragment = /* @__PURE__ */ Symbol.for("astro:fragment");
const Renderer = /* @__PURE__ */ Symbol.for("astro:renderer");
const encoder = new TextEncoder();
const decoder = new TextDecoder();
function stringifyChunk(result, chunk) {
  if (isRenderInstruction(chunk)) {
    const instruction = chunk;
    switch (instruction.type) {
      case "directive": {
        const { hydration } = instruction;
        const needsHydrationScript = hydration && determineIfNeedsHydrationScript(result);
        const needsDirectiveScript = hydration && determinesIfNeedsDirectiveScript(result, hydration.directive);
        if (needsHydrationScript) {
          const prescripts = getPrescripts(result, "both", hydration.directive);
          return markHTMLString(prescripts);
        } else if (needsDirectiveScript) {
          const prescripts = getPrescripts(result, "directive", hydration.directive);
          return markHTMLString(prescripts);
        } else {
          return "";
        }
      }
      case "head": {
        if (!shouldRenderInstruction("head", getInstructionRenderState(result))) {
          return "";
        }
        return renderAllHeadContent(result);
      }
      case "maybe-head": {
        if (!shouldRenderInstruction("maybe-head", getInstructionRenderState(result))) {
          return "";
        }
        return renderAllHeadContent(result);
      }
      case "renderer-hydration-script": {
        const { rendererSpecificHydrationScripts } = result._metadata;
        const { rendererName } = instruction;
        if (result._metadata.templateDepth > 0) {
          return instruction.render();
        }
        if (!rendererSpecificHydrationScripts.has(rendererName)) {
          rendererSpecificHydrationScripts.add(rendererName);
          return instruction.render();
        }
        return "";
      }
      case "server-island-runtime": {
        if (result._metadata.templateDepth > 0) {
          return renderServerIslandRuntime();
        }
        if (result._metadata.hasRenderedServerIslandRuntime) {
          return "";
        }
        result._metadata.hasRenderedServerIslandRuntime = true;
        return renderServerIslandRuntime();
      }
      case "script": {
        const { id, content } = instruction;
        if (result._metadata.templateDepth > 0) {
          return content;
        }
        if (result._metadata.renderedScripts.has(id)) {
          return "";
        }
        result._metadata.renderedScripts.add(id);
        return content;
      }
      case "template-enter": {
        result._metadata.templateDepth++;
        return "";
      }
      case "template-exit": {
        if (result._metadata.templateDepth <= 0) {
          throw new Error(
            "Unexpected template-exit instruction without a matching template-enter. This may indicate that the compiler emitted unbalanced template boundaries, or that a component manually injected a template-exit render instruction."
          );
        }
        result._metadata.templateDepth--;
        return "";
      }
      default: {
        throw new Error(`Unknown chunk type: ${chunk.type}`);
      }
    }
  } else if (chunk instanceof Response) {
    return "";
  } else if (isSlotString(chunk)) {
    let out = "";
    const c = chunk;
    if (c.instructions) {
      for (const instr of c.instructions) {
        out += stringifyChunk(result, instr);
      }
    }
    out += chunk.toString();
    return out;
  }
  return chunk.toString();
}
function chunkToString(result, chunk) {
  if (ArrayBuffer.isView(chunk)) {
    return decoder.decode(chunk);
  } else {
    return stringifyChunk(result, chunk);
  }
}
function chunkToByteArray(result, chunk) {
  if (ArrayBuffer.isView(chunk)) {
    return chunk;
  } else {
    const stringified = stringifyChunk(result, chunk);
    return encoder.encode(stringified.toString());
  }
}
function chunkToByteArrayOrString(result, chunk) {
  if (ArrayBuffer.isView(chunk)) {
    return chunk;
  } else {
    return stringifyChunk(result, chunk).toString();
  }
}
function isRenderInstance(obj) {
  return !!obj && typeof obj === "object" && "render" in obj && typeof obj.render === "function";
}

function renderChild(destination, child) {
  if (typeof child === "string") {
    destination.write(markHTMLString(escapeHTML(child)));
    return;
  }
  if (isPromise(child)) {
    return child.then((x) => renderChild(destination, x));
  }
  if (child instanceof SlotString) {
    destination.write(child);
    return;
  }
  if (isHTMLString(child)) {
    destination.write(child);
    return;
  }
  if (!child && child !== 0) {
    return;
  }
  if (Array.isArray(child)) {
    return renderArray(destination, child);
  }
  if (typeof child === "function") {
    return renderChild(destination, child());
  }
  if (isRenderInstance(child)) {
    return child.render(destination);
  }
  if (isRenderTemplateResult(child)) {
    return child.render(destination);
  }
  if (isAstroComponentInstance(child)) {
    return child.render(destination);
  }
  if (ArrayBuffer.isView(child)) {
    destination.write(child);
    return;
  }
  if (typeof child === "object" && (Symbol.asyncIterator in child || Symbol.iterator in child)) {
    if (Symbol.asyncIterator in child) {
      return renderAsyncIterable(destination, child);
    }
    return renderIterable(destination, child);
  }
  destination.write(child);
}
function renderArray(destination, children) {
  for (let i = 0; i < children.length; i++) {
    const result = renderChild(destination, children[i]);
    if (isPromise(result)) {
      if (i + 1 >= children.length) {
        return result;
      }
      const remaining = children.length - i - 1;
      const flushers = new Array(remaining);
      for (let j = 0; j < remaining; j++) {
        flushers[j] = createBufferedRenderer(destination, (bufferDestination) => {
          return renderChild(bufferDestination, children[i + 1 + j]);
        });
      }
      return result.then(() => {
        let k = 0;
        const iterate = () => {
          while (k < flushers.length) {
            const flushResult = flushers[k++].flush();
            if (isPromise(flushResult)) {
              return flushResult.then(iterate);
            }
          }
        };
        return iterate();
      });
    }
  }
}
function renderIterable(destination, children) {
  const iterator = children[Symbol.iterator]();
  const iterate = () => {
    for (; ; ) {
      const { value, done } = iterator.next();
      if (done) {
        break;
      }
      const result = renderChild(destination, value);
      if (isPromise(result)) {
        return result.then(iterate);
      }
    }
  };
  return iterate();
}
async function renderAsyncIterable(destination, children) {
  for await (const value of children) {
    await renderChild(destination, value);
  }
}

const astroComponentInstanceSym = /* @__PURE__ */ Symbol.for("astro.componentInstance");
class AstroComponentInstance {
  [astroComponentInstanceSym] = true;
  result;
  props;
  slotValues;
  factory;
  returnValue;
  constructor(result, props, slots, factory) {
    this.result = result;
    this.props = props;
    this.factory = factory;
    this.slotValues = {};
    for (const name in slots) {
      let didRender = false;
      let value = slots[name](result);
      this.slotValues[name] = () => {
        if (!didRender) {
          didRender = true;
          return value;
        }
        return slots[name](result);
      };
    }
  }
  init(result) {
    if (this.returnValue !== void 0) {
      return this.returnValue;
    }
    this.returnValue = this.factory(result, this.props, this.slotValues);
    if (isPromise(this.returnValue)) {
      this.returnValue.then((resolved) => {
        this.returnValue = resolved;
      }).catch(() => {
      });
    }
    return this.returnValue;
  }
  render(destination) {
    const returnValue = this.init(this.result);
    if (isPromise(returnValue)) {
      return returnValue.then((x) => this.renderImpl(destination, x));
    }
    return this.renderImpl(destination, returnValue);
  }
  renderImpl(destination, returnValue) {
    if (isHeadAndContent(returnValue)) {
      return returnValue.content.render(destination);
    } else {
      return renderChild(destination, returnValue);
    }
  }
}
function validateComponentProps(props, clientDirectives, displayName) {
  if (props != null) {
    const directives = [...clientDirectives.keys()].map((directive) => `client:${directive}`);
    for (const prop of Object.keys(props)) {
      if (directives.includes(prop)) {
        console.warn(
          `You are attempting to render <${displayName} ${prop} />, but ${displayName} is an Astro component. Astro components do not render in the client and should not have a hydration directive. Please use a framework component for client rendering.`
        );
      }
    }
  }
}
function createAstroComponentInstance(result, displayName, factory, props, slots = {}) {
  validateComponentProps(props, result.clientDirectives, displayName);
  const instance = new AstroComponentInstance(result, props, slots, factory);
  registerIfPropagating(result, factory, instance);
  return instance;
}
function isAstroComponentInstance(obj) {
  return typeof obj === "object" && obj !== null && !!obj[astroComponentInstanceSym];
}

const DOCTYPE_EXP = /<!doctype html/i;
async function renderToString(result, componentFactory, props, children, isPage = false, route) {
  const templateResult = await callComponentAsTemplateResultOrResponse(
    result,
    componentFactory,
    props,
    children,
    route
  );
  if (templateResult instanceof Response) return templateResult;
  let str = "";
  let renderedFirstPageChunk = false;
  if (isPage) {
    await bufferHeadContent(result);
  }
  const destination = {
    write(chunk) {
      if (isPage && !renderedFirstPageChunk) {
        renderedFirstPageChunk = true;
        if (!result.partial && !DOCTYPE_EXP.test(String(chunk))) {
          const doctype = result.compressHTML ? "<!DOCTYPE html>" : "<!DOCTYPE html>\n";
          str += doctype;
        }
      }
      if (chunk instanceof Response) return;
      str += chunkToString(result, chunk);
    }
  };
  await templateResult.render(destination);
  return str;
}
async function renderToReadableStream(result, componentFactory, props, children, isPage = false, route) {
  const templateResult = await callComponentAsTemplateResultOrResponse(
    result,
    componentFactory,
    props,
    children,
    route
  );
  if (templateResult instanceof Response) return templateResult;
  let renderedFirstPageChunk = false;
  if (isPage) {
    await bufferHeadContent(result);
  }
  return new ReadableStream({
    start(controller) {
      const destination = {
        write(chunk) {
          if (isPage && !renderedFirstPageChunk) {
            renderedFirstPageChunk = true;
            if (!result.partial && !DOCTYPE_EXP.test(String(chunk))) {
              const doctype = result.compressHTML ? "<!DOCTYPE html>" : "<!DOCTYPE html>\n";
              controller.enqueue(encoder.encode(doctype));
            }
          }
          if (chunk instanceof Response) {
            throw new AstroError({
              ...ResponseSentError
            });
          }
          const bytes = chunkToByteArray(result, chunk);
          controller.enqueue(bytes);
        }
      };
      (async () => {
        try {
          await templateResult.render(destination);
          controller.close();
        } catch (e) {
          if (AstroError.is(e) && !e.loc) {
            e.setLocation({
              file: route?.component
            });
          }
          setTimeout(() => controller.error(e), 0);
        }
      })();
    },
    cancel() {
      result.cancelled = true;
    }
  });
}
async function callComponentAsTemplateResultOrResponse(result, componentFactory, props, children, route) {
  const factoryResult = await componentFactory(result, props, children);
  if (factoryResult instanceof Response) {
    return factoryResult;
  } else if (isHeadAndContent(factoryResult)) {
    if (!isRenderTemplateResult(factoryResult.content)) {
      throw new AstroError({
        ...OnlyResponseCanBeReturned,
        message: OnlyResponseCanBeReturned.message(
          route?.route,
          typeof factoryResult
        ),
        location: {
          file: route?.component
        }
      });
    }
    return factoryResult.content;
  } else if (!isRenderTemplateResult(factoryResult)) {
    throw new AstroError({
      ...OnlyResponseCanBeReturned,
      message: OnlyResponseCanBeReturned.message(route?.route, typeof factoryResult),
      location: {
        file: route?.component
      }
    });
  }
  return factoryResult;
}
async function bufferHeadContent(result) {
  await bufferPropagatedHead(result);
}
async function renderToAsyncIterable(result, componentFactory, props, children, isPage = false, route) {
  const templateResult = await callComponentAsTemplateResultOrResponse(
    result,
    componentFactory,
    props,
    children,
    route
  );
  if (templateResult instanceof Response) return templateResult;
  let renderedFirstPageChunk = false;
  if (isPage) {
    await bufferHeadContent(result);
  }
  let error = null;
  let next = null;
  const buffer = [];
  let renderingComplete = false;
  const iterator = {
    async next() {
      if (result.cancelled) return { done: true, value: void 0 };
      if (next !== null) {
        await next.promise;
      } else if (!renderingComplete && !buffer.length) {
        next = promiseWithResolvers();
        await next.promise;
      }
      if (!renderingComplete) {
        next = promiseWithResolvers();
      }
      if (error) {
        throw error;
      }
      let length = 0;
      let stringToEncode = "";
      for (let i = 0, len = buffer.length; i < len; i++) {
        const bufferEntry = buffer[i];
        if (typeof bufferEntry === "string") {
          const nextIsString = i + 1 < len && typeof buffer[i + 1] === "string";
          stringToEncode += bufferEntry;
          if (!nextIsString) {
            const encoded = encoder.encode(stringToEncode);
            length += encoded.length;
            stringToEncode = "";
            buffer[i] = encoded;
          } else {
            buffer[i] = "";
          }
        } else {
          length += bufferEntry.length;
        }
      }
      let mergedArray = new Uint8Array(length);
      let offset = 0;
      for (let i = 0, len = buffer.length; i < len; i++) {
        const item = buffer[i];
        if (item === "") {
          continue;
        }
        mergedArray.set(item, offset);
        offset += item.length;
      }
      buffer.length = 0;
      const returnValue = {
        // The iterator is done when rendering has finished
        // and there are no more chunks to return.
        done: length === 0 && renderingComplete,
        value: mergedArray
      };
      return returnValue;
    },
    async return() {
      result.cancelled = true;
      return { done: true, value: void 0 };
    }
  };
  const destination = {
    write(chunk) {
      if (isPage && !renderedFirstPageChunk) {
        renderedFirstPageChunk = true;
        if (!result.partial && !DOCTYPE_EXP.test(String(chunk))) {
          const doctype = result.compressHTML ? "<!DOCTYPE html>" : "<!DOCTYPE html>\n";
          buffer.push(encoder.encode(doctype));
        }
      }
      if (chunk instanceof Response) {
        throw new AstroError(ResponseSentError);
      }
      const bytes = chunkToByteArrayOrString(result, chunk);
      if (bytes.length > 0) {
        buffer.push(bytes);
        next?.resolve();
      } else if (buffer.length > 0) {
        next?.resolve();
      }
    }
  };
  const renderResult = toPromise(() => templateResult.render(destination));
  renderResult.catch((err) => {
    error = err;
  }).finally(() => {
    renderingComplete = true;
    next?.resolve();
  });
  return {
    [Symbol.asyncIterator]() {
      return iterator;
    }
  };
}
function toPromise(fn) {
  try {
    const result = fn();
    return isPromise(result) ? result : Promise.resolve(result);
  } catch (err) {
    return Promise.reject(err);
  }
}

function componentIsHTMLElement(Component) {
  return typeof HTMLElement !== "undefined" && HTMLElement.isPrototypeOf(Component);
}
async function renderHTMLElement$1(result, constructor, props, slots) {
  const name = getHTMLElementName(constructor);
  let attrHTML = "";
  for (const attr in props) {
    attrHTML += ` ${attr}="${toAttributeString(await props[attr])}"`;
  }
  return markHTMLString(
    `<${name}${attrHTML}>${await renderSlotToString(result, slots?.default)}</${name}>`
  );
}
function getHTMLElementName(constructor) {
  const definedName = customElements.getName(constructor);
  if (definedName) return definedName;
  const assignedName = constructor.name.replace(/^HTML|Element$/g, "").replace(/[A-Z]/g, "-$&").toLowerCase().replace(/^-/, "html-");
  return assignedName;
}

const needsHeadRenderingSymbol = /* @__PURE__ */ Symbol.for("astro.needsHeadRendering");
const rendererAliases = /* @__PURE__ */ new Map([["solid", "solid-js"]]);
const clientOnlyValues = /* @__PURE__ */ new Set(["solid-js", "react", "preact", "vue", "svelte"]);
function guessRenderers(componentUrl) {
  const extname = componentUrl?.split(".").pop();
  switch (extname) {
    case "svelte":
      return ["@astrojs/svelte"];
    case "vue":
      return ["@astrojs/vue"];
    case "jsx":
    case "tsx":
      return ["@astrojs/react", "@astrojs/preact", "@astrojs/solid-js", "@astrojs/vue (jsx)"];
    case void 0:
    default:
      return [
        "@astrojs/react",
        "@astrojs/preact",
        "@astrojs/solid-js",
        "@astrojs/vue",
        "@astrojs/svelte"
      ];
  }
}
function isFragmentComponent(Component) {
  return Component === Fragment;
}
function isHTMLComponent(Component) {
  return Component && Component["astro:html"] === true;
}
const ASTRO_SLOT_EXP = /<\/?astro-slot\b[^>]*>/g;
const ASTRO_STATIC_SLOT_EXP = /<\/?astro-static-slot\b[^>]*>/g;
function removeStaticAstroSlot(html, supportsAstroStaticSlot = true) {
  const exp = supportsAstroStaticSlot ? ASTRO_STATIC_SLOT_EXP : ASTRO_SLOT_EXP;
  return html.replace(exp, "");
}
async function renderFrameworkComponent(result, displayName, Component, _props, slots = {}) {
  if (!Component && "client:only" in _props === false) {
    throw new Error(
      `Unable to render ${displayName} because it is ${Component}!
Did you forget to import the component or is it possible there is a typo?`
    );
  }
  const { renderers, clientDirectives } = result;
  const metadata = {
    astroStaticSlot: true,
    displayName
  };
  const { hydration, isPage, props, propsWithoutTransitionAttributes } = extractDirectives(
    _props,
    clientDirectives
  );
  let html = "";
  let attrs = void 0;
  if (hydration) {
    metadata.hydrate = hydration.directive;
    metadata.hydrateArgs = hydration.value;
    metadata.componentExport = hydration.componentExport;
    metadata.componentUrl = hydration.componentUrl;
  }
  const probableRendererNames = guessRenderers(metadata.componentUrl);
  const validRenderers = renderers.filter((r) => r.name !== "astro:jsx");
  const { children, slotInstructions } = await renderSlots(result, slots);
  let renderer;
  if (metadata.hydrate !== "only") {
    let isTagged = false;
    try {
      isTagged = Component && Component[Renderer];
    } catch {
    }
    if (isTagged) {
      const rendererName = Component[Renderer];
      renderer = renderers.find(({ name }) => name === rendererName);
    }
    if (!renderer) {
      let error;
      for (const r of renderers) {
        try {
          if (await r.ssr.check.call({ result }, Component, props, children, metadata)) {
            renderer = r;
            break;
          }
        } catch (e) {
          error ??= e;
        }
      }
      if (!renderer && error) {
        throw error;
      }
    }
    if (!renderer && typeof HTMLElement === "function" && componentIsHTMLElement(Component)) {
      const output = await renderHTMLElement$1(
        result,
        Component,
        _props,
        slots
      );
      return {
        render(destination) {
          destination.write(output);
        }
      };
    }
  } else {
    if (metadata.hydrateArgs) {
      const rendererName = rendererAliases.has(metadata.hydrateArgs) ? rendererAliases.get(metadata.hydrateArgs) : metadata.hydrateArgs;
      if (clientOnlyValues.has(rendererName)) {
        renderer = renderers.find(
          ({ name }) => name === `@astrojs/${rendererName}` || name === rendererName
        );
      }
    }
    if (!renderer && validRenderers.length === 1) {
      renderer = validRenderers[0];
    }
    if (!renderer) {
      const extname = metadata.componentUrl?.split(".").pop();
      renderer = renderers.find(({ name }) => name === `@astrojs/${extname}` || name === extname);
    }
    if (!renderer && metadata.hydrateArgs) {
      const rendererName = metadata.hydrateArgs;
      if (typeof rendererName === "string") {
        renderer = renderers.find(({ name }) => name === rendererName);
      }
    }
  }
  let componentServerRenderEndTime;
  if (!renderer) {
    if (metadata.hydrate === "only") {
      const rendererName = rendererAliases.has(metadata.hydrateArgs) ? rendererAliases.get(metadata.hydrateArgs) : metadata.hydrateArgs;
      if (clientOnlyValues.has(rendererName)) {
        const plural = validRenderers.length > 1;
        throw new AstroError({
          ...NoMatchingRenderer,
          message: NoMatchingRenderer.message(
            metadata.displayName,
            metadata?.componentUrl?.split(".").pop(),
            plural,
            validRenderers.length
          ),
          hint: NoMatchingRenderer.hint(
            formatList(probableRendererNames.map((r) => "`" + r + "`"))
          )
        });
      } else {
        throw new AstroError({
          ...NoClientOnlyHint,
          message: NoClientOnlyHint.message(metadata.displayName),
          hint: NoClientOnlyHint.hint(
            probableRendererNames.map((r) => r.replace("@astrojs/", "")).join("|")
          )
        });
      }
    } else if (typeof Component !== "string") {
      const matchingRenderers = validRenderers.filter(
        (r) => probableRendererNames.includes(r.name)
      );
      const plural = validRenderers.length > 1;
      if (matchingRenderers.length === 0) {
        throw new AstroError({
          ...NoMatchingRenderer,
          message: NoMatchingRenderer.message(
            metadata.displayName,
            metadata?.componentUrl?.split(".").pop(),
            plural,
            validRenderers.length
          ),
          hint: NoMatchingRenderer.hint(
            formatList(probableRendererNames.map((r) => "`" + r + "`"))
          )
        });
      } else if (matchingRenderers.length === 1) {
        renderer = matchingRenderers[0];
        ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
          { result },
          Component,
          propsWithoutTransitionAttributes,
          children,
          metadata
        ));
      } else {
        throw new Error(`Unable to render ${metadata.displayName}!

This component likely uses ${formatList(probableRendererNames)},
but Astro encountered an error during server-side rendering.

Please ensure that ${metadata.displayName}:
1. Does not unconditionally access browser-specific globals like \`window\` or \`document\`.
   If this is unavoidable, use the \`client:only\` hydration directive.
2. Does not conditionally return \`null\` or \`undefined\` when rendered on the server.
3. If using multiple JSX frameworks at the same time (e.g. React + Preact), pass the correct \`include\`/\`exclude\` options to integrations.

If you're still stuck, please open an issue on GitHub or join us at https://astro.build/chat.`);
      }
    }
  } else {
    if (metadata.hydrate === "only") {
      html = await renderSlotToString(result, slots?.fallback);
    } else {
      const componentRenderStartTime = performance.now();
      ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
        { result },
        Component,
        propsWithoutTransitionAttributes,
        children,
        metadata
      ));
      if (process.env.NODE_ENV === "development")
        componentServerRenderEndTime = performance.now() - componentRenderStartTime;
    }
  }
  if (!html && typeof Component === "string") {
    const Tag = sanitizeElementName(Component);
    const childSlots = Object.values(children).join("");
    const renderTemplateResult = renderTemplate`<${Tag}${internalSpreadAttributes(
      props,
      true,
      Tag
    )}${markHTMLString(
      childSlots === "" && voidElementNames.test(Tag) ? `/>` : `>${childSlots}</${Tag}>`
    )}`;
    html = "";
    const destination = {
      write(chunk) {
        if (chunk instanceof Response) return;
        html += chunkToString(result, chunk);
      }
    };
    await renderTemplateResult.render(destination);
  }
  if (!hydration) {
    return {
      render(destination) {
        if (slotInstructions) {
          for (const instruction of slotInstructions) {
            destination.write(instruction);
          }
        }
        if (isPage || renderer?.name === "astro:jsx") {
          destination.write(html);
        } else if (html && html.length > 0) {
          destination.write(
            markHTMLString(removeStaticAstroSlot(html, renderer?.ssr?.supportsAstroStaticSlot))
          );
        }
      }
    };
  }
  const astroId = shorthash(
    `<!--${metadata.componentExport.value}:${metadata.componentUrl}-->
${html}
${serializeProps(
      props,
      metadata
    )}`
  );
  const island = await generateHydrateScript(
    { renderer, result, astroId, props, attrs },
    metadata
  );
  if (componentServerRenderEndTime && process.env.NODE_ENV === "development")
    island.props["server-render-time"] = componentServerRenderEndTime;
  let unrenderedSlots = [];
  if (html) {
    if (Object.keys(children).length > 0) {
      for (const key of Object.keys(children)) {
        let tagName = renderer?.ssr?.supportsAstroStaticSlot ? !!metadata.hydrate ? "astro-slot" : "astro-static-slot" : "astro-slot";
        let expectedHTML = key === "default" ? `<${tagName}>` : `<${tagName} name="${escapeHTML(key)}">`;
        if (!html.includes(expectedHTML)) {
          unrenderedSlots.push(key);
        }
      }
    }
  } else {
    unrenderedSlots = Object.keys(children);
  }
  const template = unrenderedSlots.length > 0 ? unrenderedSlots.map(
    (key) => `<template data-astro-template${key !== "default" ? `="${escapeHTML(key)}"` : ""}>${children[key]}</template>`
  ).join("") : "";
  island.children = `${html ?? ""}${template}`;
  if (island.children) {
    island.props["await-children"] = "";
    island.children += `<!--astro:end-->`;
  }
  return {
    render(destination) {
      if (slotInstructions) {
        for (const instruction of slotInstructions) {
          destination.write(instruction);
        }
      }
      destination.write(createRenderInstruction({ type: "directive", hydration }));
      if (hydration.directive !== "only" && renderer?.ssr.renderHydrationScript) {
        destination.write(
          createRenderInstruction({
            type: "renderer-hydration-script",
            rendererName: renderer.name,
            render: renderer.ssr.renderHydrationScript
          })
        );
      }
      const renderedElement = renderElement$1("astro-island", island, false);
      destination.write(markHTMLString(renderedElement));
    }
  };
}
function sanitizeElementName(tag) {
  const unsafe = /[&<>'"\s]+/;
  if (!unsafe.test(tag)) return tag;
  return tag.trim().split(unsafe)[0].trim();
}
function renderFragmentComponent(result, slots = {}) {
  const slot = slots?.default;
  const preRendered = slot?.(result);
  return {
    render(destination) {
      if (preRendered == null) return;
      return renderChild(destination, preRendered);
    }
  };
}
async function renderHTMLComponent(result, Component, _props, slots = {}) {
  const { slotInstructions, children } = await renderSlots(result, slots);
  const html = Component({ slots: children });
  const hydrationHtml = slotInstructions ? slotInstructions.map((instr) => chunkToString(result, instr)).join("") : "";
  return {
    render(destination) {
      destination.write(markHTMLString(hydrationHtml + html));
    }
  };
}
function renderAstroComponent(result, displayName, Component, props, slots = {}) {
  if (containsServerDirective(props)) {
    const serverIslandComponent = new ServerIslandComponent(result, props, slots, displayName);
    result._metadata.propagators.add(serverIslandComponent);
    return serverIslandComponent;
  }
  const instance = createAstroComponentInstance(result, displayName, Component, props, slots);
  return {
    render(destination) {
      return instance.render(destination);
    }
  };
}
function renderComponent(result, displayName, Component, props, slots = {}) {
  if (isPromise(Component)) {
    return Component.catch(handleCancellation).then((x) => {
      return renderComponent(result, displayName, x, props, slots);
    });
  }
  if (isFragmentComponent(Component)) {
    return renderFragmentComponent(result, slots);
  }
  props = normalizeProps(props);
  if (isHTMLComponent(Component)) {
    return renderHTMLComponent(result, Component, props, slots).catch(handleCancellation);
  }
  if (isAstroComponentFactory(Component)) {
    return renderAstroComponent(result, displayName, Component, props, slots);
  }
  return renderFrameworkComponent(result, displayName, Component, props, slots).catch(
    handleCancellation
  );
  function handleCancellation(e) {
    if (result.cancelled)
      return {
        render() {
        }
      };
    throw e;
  }
}
function normalizeProps(props) {
  if (props["class:list"] !== void 0) {
    const value = props["class:list"];
    delete props["class:list"];
    props["class"] = clsx(props["class"], value);
    if (props["class"] === "") {
      delete props["class"];
    }
  }
  return props;
}
async function renderComponentToString(result, displayName, Component, props, slots = {}, isPage = false, route) {
  let str = "";
  let renderedFirstPageChunk = false;
  let head = "";
  if (isPage && !result.partial && nonAstroPageNeedsHeadInjection(Component)) {
    head += chunkToString(result, maybeRenderHead());
  }
  try {
    const destination = {
      write(chunk) {
        if (isPage && !result.partial && !renderedFirstPageChunk) {
          renderedFirstPageChunk = true;
          if (!/<!doctype html/i.test(String(chunk))) {
            const doctype = result.compressHTML ? "<!DOCTYPE html>" : "<!DOCTYPE html>\n";
            str += doctype + head;
          }
        }
        if (chunk instanceof Response) return;
        str += chunkToString(result, chunk);
      }
    };
    const renderInstance = await renderComponent(result, displayName, Component, props, slots);
    if (containsServerDirective(props)) {
      await bufferHeadContent(result);
    }
    await renderInstance.render(destination);
  } catch (e) {
    if (AstroError.is(e) && !e.loc) {
      e.setLocation({
        file: route?.component
      });
    }
    throw e;
  }
  return str;
}
function nonAstroPageNeedsHeadInjection(pageComponent) {
  return !!pageComponent?.[needsHeadRenderingSymbol];
}

const ClientOnlyPlaceholder$1 = "astro-client-only";
const hasTriedRenderComponentSymbol = /* @__PURE__ */ Symbol("hasTriedRenderComponent");
async function renderJSX(result, vnode) {
  switch (true) {
    case vnode instanceof HTMLString:
      if (vnode.toString().trim() === "") {
        return "";
      }
      return vnode;
    case typeof vnode === "string":
      return markHTMLString(escapeHTML(vnode));
    case typeof vnode === "function":
      return vnode;
    case (!vnode && vnode !== 0):
      return "";
    case Array.isArray(vnode): {
      const renderedItems = await Promise.all(vnode.map((v) => renderJSX(result, v)));
      let instructions = null;
      let content = "";
      for (const item of renderedItems) {
        if (item instanceof SlotString) {
          content += item;
          instructions = mergeSlotInstructions(instructions, item);
        } else {
          content += item;
        }
      }
      if (instructions) {
        return markHTMLString(new SlotString(content, instructions));
      }
      return markHTMLString(content);
    }
  }
  return renderJSXVNode(result, vnode);
}
async function renderJSXVNode(result, vnode) {
  if (isVNode(vnode)) {
    switch (true) {
      case !vnode.type: {
        throw new Error(`Unable to render ${result.pathname} because it contains an undefined Component!
Did you forget to import the component or is it possible there is a typo?`);
      }
      case vnode.type === /* @__PURE__ */ Symbol.for("astro:fragment"):
        return renderJSX(result, vnode.props.children);
      case isAstroComponentFactory(vnode.type): {
        let props = {};
        let slots = {};
        for (const [key, value] of Object.entries(vnode.props ?? {})) {
          if (key === "children" || value && typeof value === "object" && value["$$slot"]) {
            slots[key === "children" ? "default" : key] = () => renderJSX(result, value);
          } else {
            props[key] = value;
          }
        }
        const str = await renderComponentToString(
          result,
          vnode.type.name,
          vnode.type,
          props,
          slots
        );
        const html = markHTMLString(str);
        return html;
      }
      case (!vnode.type && vnode.type !== 0):
        return "";
      case (typeof vnode.type === "string" && vnode.type !== ClientOnlyPlaceholder$1 && !vnode.type.includes("-")):
        return markHTMLString(await renderElement(result, vnode.type, vnode.props ?? {}));
    }
    if (vnode.type) {
      let extractSlots2 = function(child) {
        if (Array.isArray(child)) {
          return child.map((c) => extractSlots2(c));
        }
        if (!isVNode(child)) {
          _slots.default.push(child);
          return;
        }
        if ("slot" in child.props && !isCustomElement) {
          _slots[child.props.slot] = [..._slots[child.props.slot] ?? [], child];
          delete child.props.slot;
          return;
        }
        _slots.default.push(child);
      };
      if (typeof vnode.type === "function" && vnode.props["server:root"]) {
        const output2 = await vnode.type(vnode.props ?? {});
        return await renderJSX(result, output2);
      }
      if (typeof vnode.type === "function") {
        if (vnode.props[hasTriedRenderComponentSymbol]) {
          delete vnode.props[hasTriedRenderComponentSymbol];
          const output2 = await vnode.type(vnode.props ?? {});
          if (output2?.[AstroJSX] || !output2) {
            return await renderJSXVNode(result, output2);
          } else {
            return;
          }
        } else {
          vnode.props[hasTriedRenderComponentSymbol] = true;
        }
      }
      const { children = null, ...props } = vnode.props ?? {};
      const _slots = {
        default: []
      };
      const isCustomElement = typeof vnode.type === "string" && vnode.type.includes("-");
      extractSlots2(children);
      for (const [key, value] of Object.entries(props)) {
        if (value?.["$$slot"]) {
          _slots[key] = value;
          delete props[key];
        }
      }
      const slotPromises = [];
      const slots = {};
      for (const [key, value] of Object.entries(_slots)) {
        slotPromises.push(
          renderJSX(result, value).then((output2) => {
            if (output2.toString().trim().length === 0) return;
            slots[key] = () => output2;
          })
        );
      }
      await Promise.all(slotPromises);
      let output;
      if (vnode.type === ClientOnlyPlaceholder$1 && vnode.props["client:only"]) {
        output = await renderComponentToString(
          result,
          vnode.props["client:display-name"] ?? "",
          null,
          props,
          slots
        );
      } else {
        output = await renderComponentToString(
          result,
          typeof vnode.type === "function" ? vnode.type.name : vnode.type,
          vnode.type,
          props,
          slots
        );
      }
      return markHTMLString(output);
    }
  }
  return markHTMLString(`${vnode}`);
}
async function renderElement(result, tag, { children, ...props }) {
  return markHTMLString(
    `<${tag}${spreadAttributes(props)}${markHTMLString(
      (children == null || children === "") && voidElementNames.test(tag) ? `/>` : `>${children == null ? "" : await renderJSX(result, prerenderElementChildren$1(tag, children))}</${tag}>`
    )}`
  );
}
function prerenderElementChildren$1(tag, children) {
  if (typeof children === "string" && (tag === "style" || tag === "script")) {
    return markHTMLString(children);
  } else {
    return children;
  }
}

const ClientOnlyPlaceholder = "astro-client-only";
function renderJSXToQueue(vnode, result, queue, pool, stack, parent, metadata) {
  if (vnode instanceof HTMLString) {
    const html = vnode.toString();
    if (html.trim() === "") return;
    const node = pool.acquire("html-string", html);
    node.html = html;
    queue.nodes.push(node);
    return;
  }
  if (typeof vnode === "string") {
    const node = pool.acquire("text", vnode);
    node.content = vnode;
    queue.nodes.push(node);
    return;
  }
  if (typeof vnode === "number" || typeof vnode === "boolean") {
    const str = String(vnode);
    const node = pool.acquire("text", str);
    node.content = str;
    queue.nodes.push(node);
    return;
  }
  if (vnode == null || vnode === false) {
    return;
  }
  if (Array.isArray(vnode)) {
    for (let i = vnode.length - 1; i >= 0; i = i - 1) {
      stack.push({ node: vnode[i], parent, metadata });
    }
    return;
  }
  if (!isVNode(vnode)) {
    const str = String(vnode);
    const node = pool.acquire("text", str);
    node.content = str;
    queue.nodes.push(node);
    return;
  }
  handleVNode(vnode, result, queue, pool, stack, parent, metadata);
}
function handleVNode(vnode, result, queue, pool, stack, parent, metadata) {
  if (!vnode.type) {
    throw new Error(
      `Unable to render ${result.pathname} because it contains an undefined Component!
Did you forget to import the component or is it possible there is a typo?`
    );
  }
  if (vnode.type === /* @__PURE__ */ Symbol.for("astro:fragment")) {
    stack.push({ node: vnode.props?.children, parent, metadata });
    return;
  }
  if (isAstroComponentFactory(vnode.type)) {
    const factory = vnode.type;
    let props = {};
    let slots = {};
    for (const [key, value] of Object.entries(vnode.props ?? {})) {
      if (key === "children" || value && typeof value === "object" && value["$$slot"]) {
        slots[key === "children" ? "default" : key] = () => renderJSX(result, value);
      } else {
        props[key] = value;
      }
    }
    const displayName = metadata?.displayName || factory.name || "Anonymous";
    const instance = createAstroComponentInstance(result, displayName, factory, props, slots);
    const queueNode = pool.acquire("component");
    queueNode.instance = instance;
    queue.nodes.push(queueNode);
    return;
  }
  if (typeof vnode.type === "string" && vnode.type !== ClientOnlyPlaceholder) {
    renderHTMLElement(vnode, result, queue, pool, stack, parent, metadata);
    return;
  }
  if (typeof vnode.type === "function") {
    if (vnode.props?.["server:root"]) {
      const output3 = vnode.type(vnode.props ?? {});
      stack.push({ node: output3, parent, metadata });
      return;
    }
    const output2 = vnode.type(vnode.props ?? {});
    stack.push({ node: output2, parent, metadata });
    return;
  }
  const output = renderJSX(result, vnode);
  stack.push({ node: output, parent, metadata });
}
function renderHTMLElement(vnode, _result, queue, pool, stack, parent, metadata) {
  const tag = vnode.type;
  const { children, ...props } = vnode.props ?? {};
  const attrs = spreadAttributes(props);
  const isVoidElement = (children == null || children === "") && voidElementNames.test(tag);
  if (isVoidElement) {
    const html = `<${tag}${attrs}/>`;
    const node = pool.acquire("html-string", html);
    node.html = html;
    queue.nodes.push(node);
    return;
  }
  const openTag = `<${tag}${attrs}>`;
  const openTagHtml = queue.htmlStringCache ? queue.htmlStringCache.getOrCreate(openTag) : markHTMLString(openTag);
  stack.push({ node: openTagHtml, parent, metadata });
  if (children != null && children !== "") {
    const processedChildren = prerenderElementChildren(tag, children, queue.htmlStringCache);
    stack.push({ node: processedChildren, parent, metadata });
  }
  const closeTag = `</${tag}>`;
  const closeTagHtml = queue.htmlStringCache ? queue.htmlStringCache.getOrCreate(closeTag) : markHTMLString(closeTag);
  stack.push({ node: closeTagHtml, parent, metadata });
}
function prerenderElementChildren(tag, children, htmlStringCache) {
  if (typeof children === "string" && (tag === "style" || tag === "script")) {
    return htmlStringCache ? htmlStringCache.getOrCreate(children) : markHTMLString(children);
  }
  return children;
}

async function buildRenderQueue(root, result, pool) {
  const queue = {
    nodes: [],
    result,
    pool,
    htmlStringCache: result._experimentalQueuedRendering?.htmlStringCache
  };
  const stack = [{ node: root, parent: null }];
  while (stack.length > 0) {
    const item = stack.pop();
    if (!item) {
      continue;
    }
    let { node, parent } = item;
    if (isPromise(node)) {
      try {
        const resolved = await node;
        stack.push({ node: resolved, parent, metadata: item.metadata });
      } catch (error) {
        throw error;
      }
      continue;
    }
    if (node == null || node === false) {
      continue;
    }
    if (typeof node === "string") {
      const queueNode = pool.acquire("text", node);
      queueNode.content = node;
      queue.nodes.push(queueNode);
      continue;
    }
    if (typeof node === "number" || typeof node === "boolean") {
      const str = String(node);
      const queueNode = pool.acquire("text", str);
      queueNode.content = str;
      queue.nodes.push(queueNode);
      continue;
    }
    if (isHTMLString(node)) {
      const html = node.toString();
      const queueNode = pool.acquire("html-string", html);
      queueNode.html = html;
      queue.nodes.push(queueNode);
      continue;
    }
    if (node instanceof SlotString) {
      const html = node.toString();
      const queueNode = pool.acquire("html-string", html);
      queueNode.html = html;
      queue.nodes.push(queueNode);
      continue;
    }
    if (isVNode(node)) {
      renderJSXToQueue(node, result, queue, pool, stack, parent, item.metadata);
      continue;
    }
    if (Array.isArray(node)) {
      for (const n of node) {
        stack.push({ node: n, parent, metadata: item.metadata });
      }
      continue;
    }
    if (isRenderInstruction(node)) {
      const queueNode = pool.acquire("instruction");
      queueNode.instruction = node;
      queue.nodes.push(queueNode);
      continue;
    }
    if (isRenderTemplateResult(node)) {
      const htmlParts = node["htmlParts"];
      const expressions = node["expressions"];
      if (htmlParts[0]) {
        const htmlString = queue.htmlStringCache ? queue.htmlStringCache.getOrCreate(htmlParts[0]) : markHTMLString(htmlParts[0]);
        stack.push({
          node: htmlString,
          parent,
          metadata: item.metadata
        });
      }
      for (let i = 0; i < expressions.length; i = i + 1) {
        stack.push({ node: expressions[i], parent, metadata: item.metadata });
        if (htmlParts[i + 1]) {
          const htmlString = queue.htmlStringCache ? queue.htmlStringCache.getOrCreate(htmlParts[i + 1]) : markHTMLString(htmlParts[i + 1]);
          stack.push({
            node: htmlString,
            parent,
            metadata: item.metadata
          });
        }
      }
      continue;
    }
    if (isAstroComponentInstance(node)) {
      const queueNode = pool.acquire("component");
      queueNode.instance = node;
      queue.nodes.push(queueNode);
      continue;
    }
    if (isAstroComponentFactory(node)) {
      const factory = node;
      const props = item.metadata?.props || {};
      const slots = item.metadata?.slots || {};
      const displayName = item.metadata?.displayName || factory.name || "Anonymous";
      const instance = createAstroComponentInstance(result, displayName, factory, props, slots);
      const queueNode = pool.acquire("component");
      queueNode.instance = instance;
      if (isAPropagatingComponent(result, factory)) {
        try {
          const returnValue = await instance.init(result);
          if (isHeadAndContent(returnValue) && returnValue.head) {
            result._metadata.extraHead.push(returnValue.head);
          }
        } catch (error) {
          throw error;
        }
      }
      queue.nodes.push(queueNode);
      continue;
    }
    if (isRenderInstance(node)) {
      const queueNode = pool.acquire("component");
      queueNode.instance = node;
      queue.nodes.push(queueNode);
      continue;
    }
    if (typeof node === "object" && Symbol.iterator in node) {
      const items = Array.from(node);
      for (const iterItem of items) {
        stack.push({ node: iterItem, parent, metadata: item.metadata });
      }
      continue;
    }
    if (typeof node === "object" && Symbol.asyncIterator in node) {
      try {
        const items = [];
        for await (const asyncItem of node) {
          items.push(asyncItem);
        }
        for (const iterItem of items) {
          stack.push({ node: iterItem, parent, metadata: item.metadata });
        }
      } catch (error) {
        throw error;
      }
      continue;
    }
    if (node instanceof Response) {
      const queueNode = pool.acquire("html-string", "");
      queueNode.html = "";
      queue.nodes.push(queueNode);
      continue;
    }
    if (isHTMLString(node)) {
      const html = String(node);
      const queueNode = pool.acquire("html-string", html);
      queueNode.html = html;
      queue.nodes.push(queueNode);
    } else {
      const str = String(node);
      const queueNode = pool.acquire("text", str);
      queueNode.content = str;
      queue.nodes.push(queueNode);
    }
  }
  queue.nodes.reverse();
  return queue;
}

async function renderQueue(queue, destination) {
  const result = queue.result;
  const pool = queue.pool;
  const cache = queue.htmlStringCache;
  let batchBuffer = "";
  let i = 0;
  while (i < queue.nodes.length) {
    const node = queue.nodes[i];
    try {
      if (canBatch(node)) {
        const batchStart = i;
        while (i < queue.nodes.length && canBatch(queue.nodes[i])) {
          batchBuffer += renderNodeToString(queue.nodes[i]);
          i = i + 1;
        }
        if (batchBuffer) {
          const htmlString = cache ? cache.getOrCreate(batchBuffer) : markHTMLString(batchBuffer);
          destination.write(htmlString);
          batchBuffer = "";
        }
        if (pool) {
          for (let j = batchStart; j < i; j++) {
            pool.release(queue.nodes[j]);
          }
        }
      } else {
        await renderNode(node, destination, result);
        if (pool) {
          pool.release(node);
        }
        i = i + 1;
      }
    } catch (error) {
      throw error;
    }
  }
  if (batchBuffer) {
    const htmlString = cache ? cache.getOrCreate(batchBuffer) : markHTMLString(batchBuffer);
    destination.write(htmlString);
  }
}
function canBatch(node) {
  return node.type === "text" || node.type === "html-string";
}
function renderNodeToString(node) {
  switch (node.type) {
    case "text":
      return node.content ? escapeHTML(node.content) : "";
    case "html-string":
      return node.html || "";
    case "component":
    case "instruction": {
      return "";
    }
  }
}
async function renderNode(node, destination, result) {
  const cache = result._experimentalQueuedRendering?.htmlStringCache;
  switch (node.type) {
    case "text": {
      if (node.content) {
        const escaped = escapeHTML(node.content);
        const htmlString = cache ? cache.getOrCreate(escaped) : markHTMLString(escaped);
        destination.write(htmlString);
      }
      break;
    }
    case "html-string": {
      if (node.html) {
        const htmlString = cache ? cache.getOrCreate(node.html) : markHTMLString(node.html);
        destination.write(htmlString);
      }
      break;
    }
    case "instruction": {
      if (node.instruction) {
        destination.write(node.instruction);
      }
      break;
    }
    case "component": {
      if (node.instance) {
        let componentHtml = "";
        const componentDestination = {
          write(chunk) {
            if (chunk instanceof Response) return;
            componentHtml += chunkToString(result, chunk);
          }
        };
        await node.instance.render(componentDestination);
        if (componentHtml) {
          destination.write(componentHtml);
        }
      }
      break;
    }
  }
}

async function renderPage(result, componentFactory, props, children, streaming, route) {
  if (!isAstroComponentFactory(componentFactory)) {
    result._metadata.headInTree = result.componentMetadata.get(componentFactory.moduleId)?.containsHead ?? false;
    const pageProps = { ...props ?? {}, "server:root": true };
    let str;
    if (result._experimentalQueuedRendering && result._experimentalQueuedRendering.enabled) {
      let vnode = await componentFactory(pageProps);
      if (componentFactory["astro:html"] && typeof vnode === "string") {
        vnode = markHTMLString(vnode);
      }
      const queue = await buildRenderQueue(
        vnode,
        result,
        result._experimentalQueuedRendering.pool
      );
      let html = "";
      let renderedFirst = false;
      const destination = {
        write(chunk) {
          if (chunk instanceof Response) return;
          if (!renderedFirst && !result.partial) {
            renderedFirst = true;
            const chunkStr = String(chunk);
            if (!/<!doctype html/i.test(chunkStr)) {
              const doctype = result.compressHTML ? "<!DOCTYPE html>" : "<!DOCTYPE html>\n";
              html += doctype;
            }
          }
          html += chunkToString(result, chunk);
        }
      };
      await renderQueue(queue, destination);
      str = html;
    } else {
      str = await renderComponentToString(
        result,
        componentFactory.name,
        componentFactory,
        pageProps,
        {},
        true,
        route
      );
    }
    const bytes = encoder.encode(str);
    const headers2 = new Headers([
      ["Content-Type", "text/html"],
      ["Content-Length", bytes.byteLength.toString()]
    ]);
    if (result.shouldInjectCspMetaTags && (result.cspDestination === "header" || result.cspDestination === "adapter")) {
      headers2.set("content-security-policy", renderCspContent(result));
    }
    return new Response(bytes, {
      headers: headers2,
      status: result.response.status
    });
  }
  result._metadata.headInTree = result.componentMetadata.get(componentFactory.moduleId)?.containsHead ?? false;
  let body;
  if (streaming) {
    if (isNode && !isDeno) {
      const nodeBody = await renderToAsyncIterable(
        result,
        componentFactory,
        props,
        children,
        true,
        route
      );
      body = nodeBody;
    } else {
      body = await renderToReadableStream(result, componentFactory, props, children, true, route);
    }
  } else {
    body = await renderToString(result, componentFactory, props, children, true, route);
  }
  if (body instanceof Response) return body;
  const init = result.response;
  const headers = new Headers(init.headers);
  if (result.shouldInjectCspMetaTags && result.cspDestination === "header" || result.cspDestination === "adapter") {
    headers.set("content-security-policy", renderCspContent(result));
  }
  if (!streaming && typeof body === "string") {
    body = encoder.encode(body);
    headers.set("Content-Length", body.byteLength.toString());
  }
  let status = init.status;
  let statusText = init.statusText;
  if (route?.route === "/404") {
    status = 404;
    if (statusText === "OK") {
      statusText = "Not Found";
    }
  } else if (route?.route === "/500") {
    status = 500;
    if (statusText === "OK") {
      statusText = "Internal Server Error";
    }
  }
  if (status) {
    return new Response(body, { ...init, headers, status, statusText });
  } else {
    return new Response(body, { ...init, headers });
  }
}

"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_".split("").reduce((v, c) => (v[c.charCodeAt(0)] = c, v), []);
"-0123456789_".split("").reduce((v, c) => (v[c.charCodeAt(0)] = c, v), []);

function spreadAttributes(values = {}, _name, { class: scopedClassName } = {}) {
  let output = "";
  if (scopedClassName) {
    if (typeof values.class !== "undefined") {
      values.class += ` ${scopedClassName}`;
    } else if (typeof values["class:list"] !== "undefined") {
      values["class:list"] = [values["class:list"], scopedClassName];
    } else {
      values.class = scopedClassName;
    }
  }
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, true, _name);
  }
  return markHTMLString(output);
}

function getPattern(segments, base, addTrailingSlash) {
  const pathname = segments.map((segment) => {
    if (segment.length === 1 && segment[0].spread) {
      return "(?:\\/(.*?))?";
    } else {
      return "\\/" + segment.map((part) => {
        if (part.spread) {
          return "(.*?)";
        } else if (part.dynamic) {
          return "([^/]+?)";
        } else {
          return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        }
      }).join("");
    }
  }).join("");
  const trailing = addTrailingSlash && segments.length ? getTrailingSlashPattern(addTrailingSlash) : "$";
  let initial = "\\/";
  if (addTrailingSlash === "never" && base !== "/" && pathname !== "") {
    initial = "";
  }
  return new RegExp(`^${pathname || initial}${trailing}`);
}
function getTrailingSlashPattern(addTrailingSlash) {
  if (addTrailingSlash === "always") {
    return "\\/$";
  }
  if (addTrailingSlash === "never") {
    return "$";
  }
  return "\\/?$";
}

const SERVER_ISLAND_ROUTE = "/_server-islands/[name]";
const SERVER_ISLAND_COMPONENT = "_server-islands.astro";
function badRequest(reason) {
  return new Response(null, {
    status: 400,
    statusText: "Bad request: " + reason
  });
}
const DEFAULT_BODY_SIZE_LIMIT = 1024 * 1024;
async function getRequestData(request, bodySizeLimit = DEFAULT_BODY_SIZE_LIMIT) {
  switch (request.method) {
    case "GET": {
      const url = new URL(request.url);
      const params = url.searchParams;
      if (!params.has("s") || !params.has("e") || !params.has("p")) {
        return badRequest("Missing required query parameters.");
      }
      const encryptedSlots = params.get("s");
      return {
        encryptedComponentExport: params.get("e"),
        encryptedProps: params.get("p"),
        encryptedSlots
      };
    }
    case "POST": {
      try {
        const body = await readBodyWithLimit(request, bodySizeLimit);
        const raw = new TextDecoder().decode(body);
        const data = JSON.parse(raw);
        if (Object.hasOwn(data, "slots") && typeof data.slots === "object") {
          return badRequest("Plaintext slots are not allowed. Slots must be encrypted.");
        }
        if (Object.hasOwn(data, "componentExport") && typeof data.componentExport === "string") {
          return badRequest(
            "Plaintext componentExport is not allowed. componentExport must be encrypted."
          );
        }
        return data;
      } catch (e) {
        if (e instanceof BodySizeLimitError) {
          return new Response(null, {
            status: 413,
            statusText: e.message
          });
        }
        if (e instanceof SyntaxError) {
          return badRequest("Request format is invalid.");
        }
        throw e;
      }
    }
    default: {
      return new Response(null, { status: 405 });
    }
  }
}
function createEndpoint(manifest) {
  const page = async (result) => {
    const params = result.params;
    if (!params.name) {
      return new Response(null, {
        status: 400,
        statusText: "Bad request"
      });
    }
    const componentId = params.name;
    const data = await getRequestData(result.request, manifest.serverIslandBodySizeLimit);
    if (data instanceof Response) {
      return data;
    }
    const serverIslandMappings = await manifest.serverIslandMappings?.();
    const serverIslandMap = await serverIslandMappings?.serverIslandMap;
    let imp = serverIslandMap?.get(componentId);
    if (!imp) {
      return new Response(null, {
        status: 404,
        statusText: "Not found"
      });
    }
    const key = await manifest.key;
    let componentExport;
    try {
      componentExport = await decryptString(
        key,
        data.encryptedComponentExport,
        `export:${componentId}`
      );
    } catch (_e) {
      return badRequest("Encrypted componentExport value is invalid.");
    }
    const encryptedProps = data.encryptedProps;
    let props = {};
    if (encryptedProps !== "") {
      try {
        const propString = await decryptString(key, encryptedProps, `props:${componentId}`);
        props = JSON.parse(propString);
      } catch (_e) {
        return badRequest("Encrypted props value is invalid.");
      }
    }
    let decryptedSlots = {};
    const encryptedSlots = data.encryptedSlots;
    if (encryptedSlots !== "") {
      try {
        const slotsString = await decryptString(key, encryptedSlots, `slots:${componentId}`);
        decryptedSlots = JSON.parse(slotsString);
      } catch (_e) {
        return badRequest("Encrypted slots value is invalid.");
      }
    }
    const componentModule = await imp();
    let Component = componentModule[componentExport];
    const slots = {};
    for (const prop in decryptedSlots) {
      slots[prop] = createSlotValueFromString(decryptedSlots[prop]);
    }
    result.response.headers.set("X-Robots-Tag", "noindex");
    if (isAstroComponentFactory(Component)) {
      const ServerIsland = Component;
      Component = function(...args) {
        return ServerIsland.apply(this, args);
      };
      Object.assign(Component, ServerIsland);
      Component.propagation = "self";
    }
    return renderTemplate`${renderComponent(result, "Component", Component, props, slots)}`;
  };
  page.isAstroComponentFactory = true;
  const instance = {
    default: page,
    partial: true
  };
  return instance;
}

function createDefaultRoutes(manifest) {
  const root = new URL(manifest.rootDir);
  return [
    {
      instance: default404Instance,
      matchesComponent: (filePath) => filePath.href === new URL(DEFAULT_404_COMPONENT, root).href,
      route: DEFAULT_404_ROUTE.route,
      component: DEFAULT_404_COMPONENT
    },
    {
      instance: createEndpoint(manifest),
      matchesComponent: (filePath) => filePath.href === new URL(SERVER_ISLAND_COMPONENT, root).href,
      route: SERVER_ISLAND_ROUTE,
      component: SERVER_ISLAND_COMPONENT
    }
  ];
}

function ensure404Route(manifest) {
  if (!manifest.routes.some((route) => route.route === "/404")) {
    manifest.routes.push(DEFAULT_404_ROUTE);
  }
  return manifest;
}

function routeIsRedirect(route) {
  return route?.type === "redirect";
}
function routeIsFallback(route) {
  return route?.type === "fallback";
}
function getFallbackRoute(route, routeList) {
  const fallbackRoute = routeList.find((r) => {
    if (route.route === "/" && r.routeData.route === "/") {
      return true;
    }
    return r.routeData.fallbackRoutes.find((f) => {
      return f.route === route.route;
    });
  });
  if (!fallbackRoute) {
    throw new Error(`No fallback route found for route ${route.route}`);
  }
  return fallbackRoute.routeData;
}
function getCustom404Route(manifestData) {
  return manifestData.routes.find((r) => isRoute404(r.route));
}
function routeHasHtmlExtension(route) {
  return route.segments.some(
    (segment) => segment.some((part) => !part.dynamic && part.content.includes(".html"))
  );
}

async function getProps(opts) {
  const {
    logger,
    mod,
    routeData: route,
    routeCache,
    pathname,
    serverLike,
    base,
    trailingSlash
  } = opts;
  if (!route || route.pathname) {
    return {};
  }
  if (routeIsRedirect(route) || routeIsFallback(route) || route.component === DEFAULT_404_COMPONENT) {
    return {};
  }
  const staticPaths = await callGetStaticPaths({
    mod,
    route,
    routeCache,
    ssr: serverLike,
    base,
    trailingSlash
  });
  const params = getParams(route, pathname);
  const matchedStaticPath = findPathItemByKey(staticPaths, params, route, logger, trailingSlash);
  if (!matchedStaticPath && route.origin !== "internal" && (serverLike ? route.prerender : true)) {
    throw new AstroError({
      ...NoMatchingStaticPathFound,
      message: NoMatchingStaticPathFound.message(pathname),
      hint: NoMatchingStaticPathFound.hint([route.component])
    });
  }
  if (mod) {
    validatePrerenderEndpointCollision(route, mod, params);
  }
  const props = matchedStaticPath?.props ? { ...matchedStaticPath.props } : {};
  return props;
}
function getParams(route, pathname) {
  if (!route.params.length) return {};
  const path = pathname.endsWith(".html") && route.type === "page" && !routeHasHtmlExtension(route) ? pathname.slice(0, -5) : pathname;
  const allPatterns = [route, ...route.fallbackRoutes].map((r) => r.pattern);
  const paramsMatch = allPatterns.map((pattern) => pattern.exec(path)).find((x) => x);
  if (!paramsMatch) return {};
  const params = {};
  route.params.forEach((key, i) => {
    if (key.startsWith("...")) {
      params[key.slice(3)] = paramsMatch[i + 1] ? paramsMatch[i + 1] : void 0;
    } else {
      params[key] = paramsMatch[i + 1];
    }
  });
  return params;
}
function validatePrerenderEndpointCollision(route, mod, params) {
  if (route.type === "endpoint" && mod.getStaticPaths) {
    const lastSegment = route.segments[route.segments.length - 1];
    const paramValues = Object.values(params);
    const lastParam = paramValues[paramValues.length - 1];
    if (lastSegment.length === 1 && lastSegment[0].dynamic && lastParam === void 0) {
      throw new AstroError({
        ...PrerenderDynamicEndpointPathCollide,
        message: PrerenderDynamicEndpointPathCollide.message(route.route),
        hint: PrerenderDynamicEndpointPathCollide.hint(route.component),
        location: {
          file: route.component
        }
      });
    }
  }
}

function routeComparator(a, b) {
  const commonLength = Math.min(a.segments.length, b.segments.length);
  for (let index = 0; index < commonLength; index++) {
    const aSegment = a.segments[index];
    const bSegment = b.segments[index];
    const aIsStatic = aSegment.every((part) => !part.dynamic && !part.spread);
    const bIsStatic = bSegment.every((part) => !part.dynamic && !part.spread);
    if (aIsStatic && bIsStatic) {
      const aContent = aSegment.map((part) => part.content).join("");
      const bContent = bSegment.map((part) => part.content).join("");
      if (aContent !== bContent) {
        return aContent.localeCompare(bContent);
      }
    }
    if (aIsStatic !== bIsStatic) {
      return aIsStatic ? -1 : 1;
    }
    const aAllDynamic = aSegment.every((part) => part.dynamic);
    const bAllDynamic = bSegment.every((part) => part.dynamic);
    if (aAllDynamic !== bAllDynamic) {
      return aAllDynamic ? 1 : -1;
    }
    const aHasSpread = aSegment.some((part) => part.spread);
    const bHasSpread = bSegment.some((part) => part.spread);
    if (aHasSpread !== bHasSpread) {
      return aHasSpread ? 1 : -1;
    }
  }
  const aLength = a.segments.length;
  const bLength = b.segments.length;
  if (aLength !== bLength) {
    const aEndsInRest = a.segments.at(-1)?.some((part) => part.spread);
    const bEndsInRest = b.segments.at(-1)?.some((part) => part.spread);
    if (aEndsInRest !== bEndsInRest && Math.abs(aLength - bLength) === 1) {
      if (aLength > bLength && aEndsInRest) {
        return 1;
      }
      if (bLength > aLength && bEndsInRest) {
        return -1;
      }
    }
    return aLength > bLength ? -1 : 1;
  }
  if (a.type === "endpoint" !== (b.type === "endpoint")) {
    return a.type === "endpoint" ? -1 : 1;
  }
  return a.route.localeCompare(b.route);
}

class Router {
  #routes;
  #base;
  #baseWithoutTrailingSlash;
  #buildFormat;
  #trailingSlash;
  constructor(routes, options) {
    this.#routes = [...routes].sort(routeComparator);
    this.#base = normalizeBase(options.base);
    this.#baseWithoutTrailingSlash = removeTrailingForwardSlash(this.#base);
    this.#buildFormat = options.buildFormat;
    this.#trailingSlash = options.trailingSlash;
  }
  /**
   * Match an input pathname against the route list.
   * If allowWithoutBase is true, a non-base-prefixed path is still considered.
   */
  match(inputPathname, { allowWithoutBase = false } = {}) {
    const normalized = getRedirectForPathname(inputPathname);
    if (normalized.redirect) {
      return { type: "redirect", location: normalized.redirect, status: 301 };
    }
    if (this.#base !== "/") {
      const baseWithSlash = `${this.#baseWithoutTrailingSlash}/`;
      if (this.#trailingSlash === "always" && (normalized.pathname === this.#baseWithoutTrailingSlash || normalized.pathname === this.#base)) {
        return { type: "redirect", location: baseWithSlash, status: 301 };
      }
      if (this.#trailingSlash === "never" && normalized.pathname === baseWithSlash) {
        return { type: "redirect", location: this.#baseWithoutTrailingSlash, status: 301 };
      }
    }
    const baseResult = stripBase(
      normalized.pathname,
      this.#base,
      this.#baseWithoutTrailingSlash,
      this.#trailingSlash
    );
    if (!baseResult) {
      if (!allowWithoutBase) {
        return { type: "none", reason: "outside-base" };
      }
    }
    let pathname = baseResult ?? normalized.pathname;
    if (this.#buildFormat === "file") {
      pathname = normalizeFileFormatPathname(pathname);
    }
    const route = this.#routes.find((candidate) => {
      if (candidate.pattern.test(pathname)) return true;
      return candidate.fallbackRoutes.some((fallbackRoute) => fallbackRoute.pattern.test(pathname));
    });
    if (!route) {
      return { type: "none", reason: "no-match" };
    }
    const params = getParams(route, pathname);
    return { type: "match", route, params, pathname };
  }
  /**
   * Returns all routes that match the given pathname, in priority order.
   * Used when the first match (e.g. a prerendered route) cannot serve
   * the request and subsequent matches need to be tried.
   */
  matchAll(inputPathname, { allowWithoutBase = false } = {}) {
    const normalized = getRedirectForPathname(inputPathname);
    if (normalized.redirect) {
      return [];
    }
    const baseResult = stripBase(
      normalized.pathname,
      this.#base,
      this.#baseWithoutTrailingSlash,
      this.#trailingSlash
    );
    if (!baseResult && !allowWithoutBase) {
      return [];
    }
    let pathname = baseResult ?? normalized.pathname;
    if (this.#buildFormat === "file") {
      pathname = normalizeFileFormatPathname(pathname);
    }
    return this.#routes.filter((candidate) => {
      if (candidate.pattern.test(pathname)) return true;
      return candidate.fallbackRoutes.some((fallbackRoute) => fallbackRoute.pattern.test(pathname));
    });
  }
}
function normalizeBase(base) {
  if (!base) return "/";
  if (base === "/") return base;
  return prependForwardSlash(base);
}
function getRedirectForPathname(pathname) {
  let value = prependForwardSlash(pathname);
  if (value.startsWith("//")) {
    const collapsed = `/${value.replace(/^\/+/, "")}`;
    return { pathname: value, redirect: collapsed };
  }
  return { pathname: value };
}
function stripBase(pathname, base, baseWithoutTrailingSlash, trailingSlash) {
  if (base === "/") return pathname;
  const baseWithSlash = `${baseWithoutTrailingSlash}/`;
  if (pathname === baseWithoutTrailingSlash || pathname === base) {
    return trailingSlash === "always" ? null : "/";
  }
  if (pathname === baseWithSlash) {
    return trailingSlash === "never" ? null : "/";
  }
  if (pathname.startsWith(baseWithSlash)) {
    return pathname.slice(baseWithoutTrailingSlash.length);
  }
  return null;
}
function normalizeFileFormatPathname(pathname) {
  if (pathname.endsWith("/index.html")) {
    const trimmed = pathname.slice(0, -"/index.html".length);
    return trimmed === "" ? "/" : trimmed;
  }
  if (pathname.endsWith(".html")) {
    const trimmed = pathname.slice(0, -".html".length);
    return trimmed === "" ? "/" : trimmed;
  }
  return pathname;
}

function deserializeManifest(serializedManifest, routesList) {
  const routes = [];
  if (serializedManifest.routes) {
    for (const serializedRoute of serializedManifest.routes) {
      routes.push({
        ...serializedRoute,
        routeData: deserializeRouteData(serializedRoute.routeData)
      });
      const route = serializedRoute;
      route.routeData = deserializeRouteData(serializedRoute.routeData);
    }
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    rootDir: new URL(serializedManifest.rootDir),
    srcDir: new URL(serializedManifest.srcDir),
    publicDir: new URL(serializedManifest.publicDir),
    outDir: new URL(serializedManifest.outDir),
    cacheDir: new URL(serializedManifest.cacheDir),
    buildClientDir: new URL(serializedManifest.buildClientDir),
    buildServerDir: new URL(serializedManifest.buildServerDir),
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    key
  };
}
function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    // nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp
    // This pattern is serialized from Astro's own route manifest.
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin,
    distURL: rawRouteData.distURL
  };
}
function deserializeRouteInfo(rawRouteInfo) {
  return {
    styles: rawRouteInfo.styles,
    file: rawRouteInfo.file,
    links: rawRouteInfo.links,
    scripts: rawRouteInfo.scripts,
    routeData: deserializeRouteData(rawRouteInfo.routeData)
  };
}

class NodePool {
  textPool = [];
  htmlStringPool = [];
  componentPool = [];
  instructionPool = [];
  maxSize;
  enableStats;
  stats = {
    acquireFromPool: 0,
    acquireNew: 0,
    released: 0,
    releasedDropped: 0
  };
  /**
   * Creates a new object pool for queue nodes.
   *
   * @param maxSize - Maximum number of nodes to keep in the pool (default: 1000).
   *   The cap is shared across all typed sub-pools.
   * @param enableStats - Enable statistics tracking (default: false for performance)
   */
  constructor(maxSize = 1e3, enableStats = false) {
    this.maxSize = maxSize;
    this.enableStats = enableStats;
  }
  /**
   * Acquires a queue node from the pool or creates a new one if the pool is empty.
   * Pops from the type-specific sub-pool to reuse an existing object when available.
   *
   * @param type - The type of queue node to acquire
   * @param content - Optional content to set on the node (for text or html-string types)
   * @returns A queue node ready to be populated with data
   */
  acquire(type, content) {
    const pooledNode = this.popFromTypedPool(type);
    if (pooledNode) {
      if (this.enableStats) {
        this.stats.acquireFromPool = this.stats.acquireFromPool + 1;
      }
      this.resetNodeContent(pooledNode, type, content);
      return pooledNode;
    }
    if (this.enableStats) {
      this.stats.acquireNew = this.stats.acquireNew + 1;
    }
    return this.createNode(type, content);
  }
  /**
   * Creates a new node of the specified type with the given content.
   * Helper method to reduce branching in acquire().
   */
  createNode(type, content = "") {
    switch (type) {
      case "text":
        return { type: "text", content };
      case "html-string":
        return { type: "html-string", html: content };
      case "component":
        return { type: "component", instance: void 0 };
      case "instruction":
        return { type: "instruction", instruction: void 0 };
    }
  }
  /**
   * Pops a node from the type-specific sub-pool.
   * Returns undefined if the sub-pool for the requested type is empty.
   */
  popFromTypedPool(type) {
    switch (type) {
      case "text":
        return this.textPool.pop();
      case "html-string":
        return this.htmlStringPool.pop();
      case "component":
        return this.componentPool.pop();
      case "instruction":
        return this.instructionPool.pop();
    }
  }
  /**
   * Resets the content/value field on a reused pooled node.
   * The type discriminant is already correct since we pop from the matching sub-pool.
   */
  resetNodeContent(node, type, content) {
    switch (type) {
      case "text":
        node.content = content ?? "";
        break;
      case "html-string":
        node.html = content ?? "";
        break;
      case "component":
        node.instance = void 0;
        break;
      case "instruction":
        node.instruction = void 0;
        break;
    }
  }
  /**
   * Returns the total number of nodes across all typed sub-pools.
   */
  totalPoolSize() {
    return this.textPool.length + this.htmlStringPool.length + this.componentPool.length + this.instructionPool.length;
  }
  /**
   * Releases a queue node back to the pool for reuse.
   * If the pool is at max capacity, the node is discarded (will be GC'd).
   *
   * @param node - The node to release back to the pool
   */
  release(node) {
    if (this.totalPoolSize() >= this.maxSize) {
      if (this.enableStats) {
        this.stats.releasedDropped = this.stats.releasedDropped + 1;
      }
      return;
    }
    switch (node.type) {
      case "text":
        node.content = "";
        this.textPool.push(node);
        break;
      case "html-string":
        node.html = "";
        this.htmlStringPool.push(node);
        break;
      case "component":
        node.instance = void 0;
        this.componentPool.push(node);
        break;
      case "instruction":
        node.instruction = void 0;
        this.instructionPool.push(node);
        break;
    }
    if (this.enableStats) {
      this.stats.released = this.stats.released + 1;
    }
  }
  /**
   * Releases all nodes in an array back to the pool.
   * This is a convenience method for releasing multiple nodes at once.
   *
   * @param nodes - Array of nodes to release
   */
  releaseAll(nodes) {
    for (const node of nodes) {
      this.release(node);
    }
  }
  /**
   * Clears all typed sub-pools, discarding all cached nodes.
   * This can be useful if you want to free memory after a large render.
   */
  clear() {
    this.textPool.length = 0;
    this.htmlStringPool.length = 0;
    this.componentPool.length = 0;
    this.instructionPool.length = 0;
  }
  /**
   * Gets the current total number of nodes across all typed sub-pools.
   * Useful for monitoring pool usage and tuning maxSize.
   *
   * @returns Number of nodes currently available in the pool
   */
  size() {
    return this.totalPoolSize();
  }
  /**
   * Gets pool statistics for debugging.
   *
   * @returns Pool usage statistics including computed metrics
   */
  getStats() {
    return {
      ...this.stats,
      poolSize: this.totalPoolSize(),
      maxSize: this.maxSize,
      hitRate: this.stats.acquireFromPool + this.stats.acquireNew > 0 ? this.stats.acquireFromPool / (this.stats.acquireFromPool + this.stats.acquireNew) * 100 : 0
    };
  }
  /**
   * Resets pool statistics.
   */
  resetStats() {
    this.stats = {
      acquireFromPool: 0,
      acquireNew: 0,
      released: 0,
      releasedDropped: 0
    };
  }
}

class HTMLStringCache {
  cache = /* @__PURE__ */ new Map();
  maxSize;
  constructor(maxSize = 1e3) {
    this.maxSize = maxSize;
    this.warm(COMMON_HTML_PATTERNS);
  }
  /**
   * Get or create an HTMLString for the given content.
   * If cached, the existing object is returned and moved to end (most recently used).
   * If not cached, a new HTMLString is created, cached, and returned.
   *
   * @param content - The HTML string content
   * @returns HTMLString object (cached or newly created)
   */
  getOrCreate(content) {
    const cached = this.cache.get(content);
    if (cached) {
      this.cache.delete(content);
      this.cache.set(content, cached);
      return cached;
    }
    const htmlString = new HTMLString(content);
    this.cache.set(content, htmlString);
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== void 0) {
        this.cache.delete(firstKey);
      }
    }
    return htmlString;
  }
  /**
   * Get current cache size
   */
  size() {
    return this.cache.size;
  }
  /**
   * Pre-warms the cache with common HTML patterns.
   * This ensures first-render cache hits for frequently used tags.
   *
   * @param patterns - Array of HTML strings to pre-cache
   */
  warm(patterns) {
    for (const pattern of patterns) {
      if (!this.cache.has(pattern)) {
        this.cache.set(pattern, new HTMLString(pattern));
      }
    }
  }
  /**
   * Clear the entire cache
   */
  clear() {
    this.cache.clear();
  }
}
const COMMON_HTML_PATTERNS = [
  // Structural elements
  "<div>",
  "</div>",
  "<span>",
  "</span>",
  "<p>",
  "</p>",
  "<section>",
  "</section>",
  "<article>",
  "</article>",
  "<header>",
  "</header>",
  "<footer>",
  "</footer>",
  "<nav>",
  "</nav>",
  "<main>",
  "</main>",
  "<aside>",
  "</aside>",
  // List elements
  "<ul>",
  "</ul>",
  "<ol>",
  "</ol>",
  "<li>",
  "</li>",
  // Void/self-closing elements
  "<br>",
  "<hr>",
  "<br/>",
  "<hr/>",
  // Heading elements
  "<h1>",
  "</h1>",
  "<h2>",
  "</h2>",
  "<h3>",
  "</h3>",
  "<h4>",
  "</h4>",
  // Inline elements
  "<a>",
  "</a>",
  "<strong>",
  "</strong>",
  "<em>",
  "</em>",
  "<code>",
  "</code>",
  // Common whitespace
  " ",
  "\n"
];

const FORBIDDEN_PATH_KEYS = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]);

const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});
const levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 90
};
function log(opts, level, label, message, newLine = true) {
  const logLevel = opts.level;
  const dest = opts.destination;
  const event = {
    label,
    level,
    message,
    newLine
  };
  if (!isLogLevelEnabled(logLevel, level)) {
    return;
  }
  dest.write(event);
}
function isLogLevelEnabled(configuredLogLevel, level) {
  return levels[configuredLogLevel] <= levels[level];
}
function info(opts, label, message, newLine = true) {
  return log(opts, "info", label, message, newLine);
}
function warn(opts, label, message, newLine = true) {
  return log(opts, "warn", label, message, newLine);
}
function error(opts, label, message, newLine = true) {
  return log(opts, "error", label, message, newLine);
}
function debug(...args) {
  if ("_astroGlobalDebug" in globalThis) {
    globalThis._astroGlobalDebug(...args);
  }
}
function getEventPrefix({ level, label }) {
  const timestamp = `${dateTimeFormat.format(/* @__PURE__ */ new Date())}`;
  const prefix = [];
  if (level === "error" || level === "warn") {
    prefix.push(colors.bold(timestamp));
    prefix.push(`[${level.toUpperCase()}]`);
  } else {
    prefix.push(timestamp);
  }
  if (label) {
    prefix.push(`[${label}]`);
  }
  if (level === "error") {
    return colors.red(prefix.join(" "));
  }
  if (level === "warn") {
    return colors.yellow(prefix.join(" "));
  }
  if (prefix.length === 1) {
    return colors.dim(prefix[0]);
  }
  return colors.dim(prefix[0]) + " " + colors.blue(prefix.splice(1).join(" "));
}
class AstroLogger {
  options;
  constructor(options) {
    this.options = options;
  }
  info(label, message, newLine = true) {
    info(this.options, label, message, newLine);
  }
  warn(label, message, newLine = true) {
    warn(this.options, label, message, newLine);
  }
  error(label, message, newLine = true) {
    error(this.options, label, message, newLine);
  }
  debug(label, ...messages) {
    debug(label, ...messages);
  }
  level() {
    return this.options.level;
  }
  forkIntegrationLogger(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
  setDestination(destination) {
    this.options.destination = destination;
  }
  /**
   * It calls the `close` function of the provided destination, if it exists.
   */
  close() {
    if (this.options.destination.close) {
      this.options.destination.close();
    }
  }
  /**
   * It calls the `flush` function of the provided destination, if it exists.
   */
  flush() {
    if (this.options.destination.flush) {
      this.options.destination.flush();
    }
  }
}
class AstroIntegrationLogger {
  options;
  label;
  constructor(logging, label) {
    this.options = logging;
    this.label = label;
  }
  /**
   * Creates a new logger instance with a new label, but the same log options.
   */
  fork(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
  info(message) {
    info(this.options, this.label, message);
  }
  warn(message) {
    warn(this.options, this.label, message);
  }
  error(message) {
    error(this.options, this.label, message);
  }
  debug(message) {
    debug(this.label, message);
  }
  /**
   * It calls the `flush` function of the provided destination, if it exists.
   */
  flush() {
    if (this.options.destination.flush) {
      this.options.destination.flush();
    }
  }
  /**
   * It calls the `close` function of the provided destination, if it exists.
   */
  close() {
    if (this.options.destination.close) {
      this.options.destination.close();
    }
  }
}

function matchesLevel(messageLevel, configuredLevel) {
  return levels[messageLevel] >= levels[configuredLevel];
}

function nodeLogDestination(config = {}) {
  const { level = "info" } = config;
  return {
    write(event) {
      let dest = process.stderr;
      if (levels[event.level] < levels["error"]) {
        dest = process.stdout;
      }
      if (!matchesLevel(event.level, level)) {
        return;
      }
      let trailingLine = event.newLine ? "\n" : "";
      if (event.label === "SKIP_FORMAT") {
        dest.write(event.message + trailingLine);
      } else {
        dest.write(getEventPrefix(event) + " " + event.message + trailingLine);
      }
    }
  };
}
function node_default(options) {
  return nodeLogDestination(options);
}

function consoleLogDestination(config = {}) {
  const { level = "info" } = config;
  return {
    write(event) {
      let dest = console.error;
      if (levels[event.level] < levels["error"]) {
        dest = console.info;
      }
      if (!matchesLevel(event.level, level)) {
        return;
      }
      if (event.label === "SKIP_FORMAT") {
        dest(event.message);
      } else {
        dest(getEventPrefix(event) + " " + event.message);
      }
    }
  };
}
function createConsoleLogger({ level }) {
  return new AstroLogger({
    level,
    destination: consoleLogDestination()
  });
}
function console_default(options) {
  return consoleLogDestination(options);
}

const SGR_REGEX = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");
function jsonLoggerDestination(config = {}) {
  const { pretty = false, level = "info" } = config;
  return {
    write(event) {
      let dest = process.stderr;
      if (levels[event.level] < levels["error"]) {
        dest = process.stdout;
      }
      if (!matchesLevel(event.level, level)) {
        return;
      }
      let trailingLine = event.newLine ? "\n" : "";
      const message = event.message.replace(SGR_REGEX, "");
      if (pretty) {
        dest.write(
          JSON.stringify({ message, label: event.label, level: event.level }, null, 2) + trailingLine
        );
      } else {
        dest.write(
          JSON.stringify({ message, label: event.label, level: event.level }) + trailingLine
        );
      }
    }
  };
}

function compose(destinations) {
  return {
    write(chunk) {
      for (const logger of destinations) {
        logger.write(chunk);
      }
    },
    flush() {
      for (const logger of destinations) {
        if (logger.flush) {
          logger.flush();
        }
      }
    },
    close() {
      for (const logger of destinations) {
        if (logger.close) {
          logger.close();
        }
      }
    }
  };
}

async function loadLogger(config, level = "info") {
  let cause = void 0;
  try {
    switch (config.entrypoint) {
      case "astro/logger/node": {
        return new AstroLogger({
          destination: node_default(config.config),
          level
        });
      }
      case "astro/logger/console": {
        return new AstroLogger({
          destination: console_default(config.config),
          level
        });
      }
      case "astro/logger/json": {
        return new AstroLogger({
          destination: jsonLoggerDestination(config.config),
          level
        });
      }
      case "astro/logger/compose": {
        let destinations = [];
        if (config.config?.loggers) {
          const loggers = config.config?.loggers;
          destinations = await Promise.all(
            loggers.map(async (loggerConfig) => {
              const logger = await import(
                /* @vite-ignore */
                loggerConfig.entrypoint
              );
              return logger.default(loggerConfig.config);
            })
          );
        }
        return new AstroLogger({
          destination: compose(destinations),
          level
        });
      }
      default: {
        const nodeLogger = await import(
          /* @vite-ignore */
          config.entrypoint
        );
        return new AstroLogger({
          destination: nodeLogger.default(config.config),
          level
        });
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      cause = e;
    }
  }
  const error = new AstroError({
    ...UnableToLoadLogger,
    message: UnableToLoadLogger.message(config.entrypoint)
  });
  if (cause) {
    error.cause = cause;
  }
  throw error;
}

const PipelineFeatures = {
  redirects: 1 << 0,
  sessions: 1 << 1,
  actions: 1 << 2,
  middleware: 1 << 3,
  i18n: 1 << 4,
  cache: 1 << 5
};
const ALL_PIPELINE_FEATURES = PipelineFeatures.redirects | PipelineFeatures.sessions | PipelineFeatures.actions | PipelineFeatures.middleware | PipelineFeatures.i18n | PipelineFeatures.cache;
class Pipeline {
  internalMiddleware;
  resolvedMiddleware = void 0;
  resolvedLogger = false;
  resolvedActions = void 0;
  resolvedSessionDriver = void 0;
  resolvedCacheProvider = void 0;
  compiledCacheRoutes = void 0;
  nodePool;
  htmlStringCache;
  /**
   * Bit mask of pipeline features activated by handler classes.
   * Each handler sets its bit via `|=`. Only meaningful when a
   * custom `src/app.ts` fetch handler is in use.
   */
  usedFeatures = 0;
  logger;
  manifest;
  /**
   * "development" or "production" only
   */
  runtimeMode;
  renderers;
  resolve;
  streaming;
  /**
   * Used to provide better error messages for `Astro.clientAddress`
   */
  adapterName;
  clientDirectives;
  inlinedScripts;
  compressHTML;
  i18n;
  middleware;
  routeCache;
  /**
   * Used for `Astro.site`.
   */
  site;
  /**
   * Array of built-in, internal, routes.
   * Used to find the route module
   */
  defaultRoutes;
  actions;
  sessionDriver;
  cacheProvider;
  cacheConfig;
  serverIslands;
  /** Route data derived from the manifest, used for route matching. */
  manifestData;
  /** Pattern-matching router built from manifestData. */
  #router;
  constructor(logger, manifest, runtimeMode, renderers, resolve, streaming, adapterName = manifest.adapterName, clientDirectives = manifest.clientDirectives, inlinedScripts = manifest.inlinedScripts, compressHTML = manifest.compressHTML, i18n = manifest.i18n, middleware = manifest.middleware, routeCache = new RouteCache(logger, runtimeMode), site = manifest.site ? new URL(manifest.site) : void 0, defaultRoutes = createDefaultRoutes(manifest), actions = manifest.actions, sessionDriver = manifest.sessionDriver, cacheProvider = manifest.cacheProvider, cacheConfig = manifest.cacheConfig, serverIslands = manifest.serverIslandMappings) {
    this.logger = logger;
    this.manifest = manifest;
    this.runtimeMode = runtimeMode;
    this.renderers = renderers;
    this.resolve = resolve;
    this.streaming = streaming;
    this.adapterName = adapterName;
    this.clientDirectives = clientDirectives;
    this.inlinedScripts = inlinedScripts;
    this.compressHTML = compressHTML;
    this.i18n = i18n;
    this.middleware = middleware;
    this.routeCache = routeCache;
    this.site = site;
    this.defaultRoutes = defaultRoutes;
    this.actions = actions;
    this.sessionDriver = sessionDriver;
    this.cacheProvider = cacheProvider;
    this.cacheConfig = cacheConfig;
    this.serverIslands = serverIslands;
    this.manifestData = { routes: (manifest.routes ?? []).map((route) => route.routeData) };
    ensure404Route(this.manifestData);
    this.#router = new Router(this.manifestData.routes, {
      base: manifest.base,
      trailingSlash: manifest.trailingSlash,
      buildFormat: manifest.buildFormat
    });
    this.internalMiddleware = [];
    if (manifest.experimentalQueuedRendering.enabled) {
      this.nodePool = this.createNodePool(
        manifest.experimentalQueuedRendering.poolSize ?? 1e3,
        false
      );
      if (manifest.experimentalQueuedRendering.contentCache) {
        this.htmlStringCache = this.createStringCache();
      }
    }
  }
  /**
   * Low-level route matching against the manifest routes. Returns the
   * matched `RouteData` or `undefined`. Does not filter prerendered
   * routes or check public assets — use `BaseApp.match()` for that.
   */
  matchRoute(pathname) {
    const match = this.#router.match(pathname, { allowWithoutBase: true });
    if (match.type !== "match") return void 0;
    return match.route;
  }
  /**
   * Returns all routes matching the given pathname, in priority order.
   * Used when the first match cannot serve the request (e.g. a
   * prerendered dynamic route that doesn't cover this specific path)
   * and the caller needs to try subsequent matches.
   */
  matchAllRoutes(pathname) {
    return this.#router.matchAll(pathname, { allowWithoutBase: true });
  }
  /**
   * Rebuilds the internal router after routes have been added or
   * removed (e.g. by the dev server on HMR).
   */
  rebuildRouter() {
    this.#router = new Router(this.manifestData.routes, {
      base: this.manifest.base,
      trailingSlash: this.manifest.trailingSlash,
      buildFormat: this.manifest.buildFormat
    });
  }
  /**
   * Resolves the middleware from the manifest, and returns the `onRequest` function. If `onRequest` isn't there,
   * it returns a no-op function
   */
  async getMiddleware() {
    if (this.resolvedMiddleware) {
      return this.resolvedMiddleware;
    }
    if (this.middleware) {
      const middlewareInstance = await this.middleware();
      const onRequest = middlewareInstance.onRequest ?? NOOP_MIDDLEWARE_FN;
      const internalMiddlewares = [onRequest];
      if (this.manifest.checkOrigin) {
        internalMiddlewares.unshift(createOriginCheckMiddleware());
      }
      this.resolvedMiddleware = sequence(...internalMiddlewares);
      return this.resolvedMiddleware;
    } else {
      this.resolvedMiddleware = NOOP_MIDDLEWARE_FN;
      return this.resolvedMiddleware;
    }
  }
  /**
   * Clears the cached middleware so it is re-resolved on the next request.
   * Called via HMR when middleware files change during development.
   */
  clearMiddleware() {
    this.resolvedMiddleware = void 0;
  }
  /**
   * Resolves the logger destination from the manifest and updates the pipeline logger.
   * If the user configured `experimental.logger`, the bundled logger factory is loaded
   * and replaces the default console destination. This is lazy and only resolves once.
   */
  async getLogger() {
    if (this.resolvedLogger) {
      return this.logger;
    }
    this.resolvedLogger = true;
    if (this.manifest.experimentalLogger) {
      this.logger = await loadLogger(this.manifest.experimentalLogger);
    }
    return this.logger;
  }
  async getActions() {
    if (this.resolvedActions) {
      return this.resolvedActions;
    } else if (this.actions) {
      this.resolvedActions = await this.actions();
      return this.resolvedActions;
    }
    return NOOP_ACTIONS_MOD;
  }
  async getSessionDriver() {
    if (this.resolvedSessionDriver !== void 0) {
      return this.resolvedSessionDriver;
    }
    if (this.sessionDriver) {
      const driverModule = await this.sessionDriver();
      this.resolvedSessionDriver = driverModule?.default || null;
      return this.resolvedSessionDriver;
    }
    this.resolvedSessionDriver = null;
    return null;
  }
  async getCacheProvider() {
    if (this.resolvedCacheProvider !== void 0) {
      return this.resolvedCacheProvider;
    }
    if (this.cacheProvider) {
      const mod = await this.cacheProvider();
      const factory = mod?.default || null;
      this.resolvedCacheProvider = factory ? factory(this.cacheConfig?.options) : null;
      return this.resolvedCacheProvider;
    }
    this.resolvedCacheProvider = null;
    return null;
  }
  async getServerIslands() {
    if (this.serverIslands) {
      return this.serverIslands();
    }
    return {
      serverIslandMap: /* @__PURE__ */ new Map(),
      serverIslandNameMap: /* @__PURE__ */ new Map()
    };
  }
  async getAction(path) {
    const pathKeys = path.split(".").map((key) => decodeURIComponent(key));
    let { server } = await this.getActions();
    if (!server || !(typeof server === "object")) {
      throw new TypeError(
        `Expected \`server\` export in actions file to be an object. Received ${typeof server}.`
      );
    }
    for (const key of pathKeys) {
      if (FORBIDDEN_PATH_KEYS.has(key)) {
        throw new AstroError({
          ...ActionNotFoundError,
          message: ActionNotFoundError.message(pathKeys.join("."))
        });
      }
      if (!Object.hasOwn(server, key)) {
        throw new AstroError({
          ...ActionNotFoundError,
          message: ActionNotFoundError.message(pathKeys.join("."))
        });
      }
      server = server[key];
    }
    if (typeof server !== "function") {
      throw new TypeError(
        `Expected handler for action ${pathKeys.join(".")} to be a function. Received ${typeof server}.`
      );
    }
    return server;
  }
  async getModuleForRoute(route) {
    for (const defaultRoute of this.defaultRoutes) {
      if (route.component === defaultRoute.component) {
        return {
          page: () => Promise.resolve(defaultRoute.instance)
        };
      }
    }
    if (route.type === "redirect") {
      return RedirectSinglePageBuiltModule;
    } else {
      if (this.manifest.pageMap) {
        const importComponentInstance = this.manifest.pageMap.get(route.component);
        if (!importComponentInstance) {
          throw new Error(
            `Unexpectedly unable to find a component instance for route ${route.route}`
          );
        }
        return await importComponentInstance();
      } else if (this.manifest.pageModule) {
        return this.manifest.pageModule;
      }
      throw new Error(
        "Astro couldn't find the correct page to render, probably because it wasn't correctly mapped for SSR usage. This is an internal error, please file an issue."
      );
    }
  }
  createNodePool(poolSize, stats) {
    return new NodePool(poolSize, stats);
  }
  createStringCache() {
    return new HTMLStringCache(1e3);
  }
}

function getFunctionExpression(slot) {
  if (!slot) return;
  const expressions = slot?.expressions?.filter(
    (e) => isRenderInstruction(e) === false || isRenderTemplateResult(e)
  );
  if (expressions?.length !== 1) return;
  const expression = expressions[0];
  if (isRenderTemplateResult(expression)) {
    return getFunctionExpression(expression);
  }
  return expression;
}
class Slots {
  #result;
  #slots;
  #logger;
  constructor(result, slots, logger) {
    this.#result = result;
    this.#slots = slots;
    this.#logger = logger;
    if (slots) {
      for (const key of Object.keys(slots)) {
        if (this[key] !== void 0) {
          throw new AstroError({
            ...ReservedSlotName,
            message: ReservedSlotName.message(key)
          });
        }
        Object.defineProperty(this, key, {
          get() {
            return true;
          },
          enumerable: true
        });
      }
    }
  }
  has(name) {
    if (!this.#slots) return false;
    return Boolean(this.#slots[name]);
  }
  async render(name, args = []) {
    if (!this.#slots || !this.has(name)) return;
    const result = this.#result;
    if (!Array.isArray(args)) {
      this.#logger.warn(
        null,
        `Expected second parameter to be an array, received a ${typeof args}. If you're trying to pass an array as a single argument and getting unexpected results, make sure you're passing your array as an item of an array. Ex: Astro.slots.render('default', [["Hello", "World"]])`
      );
    } else if (args.length > 0) {
      const slotValue = this.#slots[name];
      const component = typeof slotValue === "function" ? await slotValue(result) : await slotValue;
      const expression = getFunctionExpression(component);
      if (expression) {
        const slot = async () => typeof expression === "function" ? expression(...args) : expression;
        return await renderSlotToString(result, slot).then((res) => {
          return res;
        });
      }
      if (typeof component === "function") {
        return await renderJSX(result, component(...args)).then(
          (res) => res != null ? String(res) : res
        );
      }
    }
    const content = await renderSlotToString(result, this.#slots[name]);
    const outHTML = chunkToString(result, content);
    return outHTML;
  }
}

function deduplicateDirectiveValues(existingDirective, newDirective) {
  const [directiveName, ...existingValues] = existingDirective.split(/\s+/).filter(Boolean);
  const [newDirectiveName, ...newValues] = newDirective.split(/\s+/).filter(Boolean);
  if (directiveName !== newDirectiveName) {
    return void 0;
  }
  const finalDirectives = Array.from(/* @__PURE__ */ new Set([...existingValues, ...newValues]));
  return `${directiveName} ${finalDirectives.join(" ")}`;
}
function pushDirective(directives, newDirective) {
  if (directives.length === 0) {
    return [newDirective];
  }
  const finalDirectives = [];
  let matched = false;
  for (const directive of directives) {
    if (matched) {
      finalDirectives.push(directive);
      continue;
    }
    const result = deduplicateDirectiveValues(directive, newDirective);
    if (result) {
      finalDirectives.push(result);
      matched = true;
    } else {
      finalDirectives.push(directive);
    }
  }
  if (!matched) {
    finalDirectives.push(newDirective);
  }
  return finalDirectives;
}

function computeFallbackRoute(options) {
  const {
    pathname,
    responseStatus,
    fallback,
    fallbackType,
    locales,
    defaultLocale,
    strategy,
    base
  } = options;
  if (responseStatus !== 404) {
    return { type: "none" };
  }
  if (!fallback || Object.keys(fallback).length === 0) {
    return { type: "none" };
  }
  const segments = pathname.split("/");
  const urlLocale = segments.find((segment) => {
    for (const locale of locales) {
      if (typeof locale === "string") {
        if (locale === segment) {
          return true;
        }
      } else if (locale.path === segment) {
        return true;
      }
    }
    return false;
  });
  if (!urlLocale) {
    return { type: "none" };
  }
  const fallbackKeys = Object.keys(fallback);
  if (!fallbackKeys.includes(urlLocale)) {
    return { type: "none" };
  }
  const fallbackLocale = fallback[urlLocale];
  const pathFallbackLocale = getPathByLocale(fallbackLocale, locales);
  let newPathname;
  if (pathFallbackLocale === defaultLocale && strategy === "pathname-prefix-other-locales") {
    if (pathname.includes(`${base}`)) {
      newPathname = pathname.replace(`/${urlLocale}`, ``);
    } else {
      newPathname = pathname.replace(`/${urlLocale}`, `/`);
    }
  } else {
    newPathname = pathname.replace(`/${urlLocale}`, `/${pathFallbackLocale}`);
  }
  return {
    type: fallbackType,
    pathname: newPathname
  };
}

class I18nRouter {
  #strategy;
  #defaultLocale;
  #locales;
  #base;
  #domains;
  constructor(options) {
    this.#strategy = options.strategy;
    this.#defaultLocale = options.defaultLocale;
    this.#locales = options.locales;
    this.#base = options.base === "/" ? "/" : removeTrailingForwardSlash(options.base || "");
    this.#domains = options.domains;
  }
  /**
   * Evaluate routing strategy for a pathname.
   * Returns decision object (not HTTP Response).
   */
  match(pathname, context) {
    if (this.shouldSkipProcessing(pathname, context)) {
      return { type: "continue" };
    }
    switch (this.#strategy) {
      case "manual":
        return { type: "continue" };
      case "pathname-prefix-always":
        return this.matchPrefixAlways(pathname, context);
      case "domains-prefix-always":
        if (this.localeHasntDomain(context.currentLocale, context.currentDomain)) {
          return { type: "continue" };
        }
        return this.matchPrefixAlways(pathname, context);
      case "pathname-prefix-other-locales":
        return this.matchPrefixOtherLocales(pathname, context);
      case "domains-prefix-other-locales":
        if (this.localeHasntDomain(context.currentLocale, context.currentDomain)) {
          return { type: "continue" };
        }
        return this.matchPrefixOtherLocales(pathname, context);
      case "pathname-prefix-always-no-redirect":
        return this.matchPrefixAlwaysNoRedirect(pathname, context);
      case "domains-prefix-always-no-redirect":
        if (this.localeHasntDomain(context.currentLocale, context.currentDomain)) {
          return { type: "continue" };
        }
        return this.matchPrefixAlwaysNoRedirect(pathname, context);
      default:
        return { type: "continue" };
    }
  }
  /**
   * Check if i18n processing should be skipped for this request
   */
  shouldSkipProcessing(pathname, context) {
    if (pathname.includes("/404") || pathname.includes("/500")) {
      return true;
    }
    if (pathname.includes("/_server-islands/")) {
      return true;
    }
    if (context.isReroute) {
      return true;
    }
    if (context.routeType && context.routeType !== "page" && context.routeType !== "fallback") {
      return true;
    }
    return false;
  }
  /**
   * Strategy: pathname-prefix-always
   * All locales must have a prefix, including the default locale.
   */
  matchPrefixAlways(pathname, _context) {
    const isRoot = pathname === this.#base + "/" || pathname === this.#base;
    if (isRoot) {
      const basePrefix = this.#base === "/" ? "" : this.#base;
      return {
        type: "redirect",
        location: `${basePrefix}/${this.#defaultLocale}`
      };
    }
    if (!pathHasLocale(pathname, this.#locales)) {
      return { type: "notFound" };
    }
    return { type: "continue" };
  }
  /**
   * Strategy: pathname-prefix-other-locales
   * Default locale has no prefix, other locales must have a prefix.
   */
  matchPrefixOtherLocales(pathname, _context) {
    let pathnameContainsDefaultLocale = false;
    for (const segment of pathname.split("/")) {
      if (normalizeTheLocale(segment) === normalizeTheLocale(this.#defaultLocale)) {
        pathnameContainsDefaultLocale = true;
        break;
      }
    }
    if (pathnameContainsDefaultLocale) {
      const newLocation = pathname.replace(`/${this.#defaultLocale}`, "");
      return {
        type: "notFound",
        location: newLocation
      };
    }
    return { type: "continue" };
  }
  /**
   * Strategy: pathname-prefix-always-no-redirect
   * Like prefix-always but allows root to serve instead of redirecting
   */
  matchPrefixAlwaysNoRedirect(pathname, _context) {
    const isRoot = pathname === this.#base + "/" || pathname === this.#base;
    if (isRoot) {
      return { type: "continue" };
    }
    if (!pathHasLocale(pathname, this.#locales)) {
      return { type: "notFound" };
    }
    return { type: "continue" };
  }
  /**
   * Check if the current locale doesn't belong to the configured domain.
   * Used for domain-based routing strategies.
   */
  localeHasntDomain(currentLocale, currentDomain) {
    if (!this.#domains || !currentDomain) {
      return false;
    }
    if (!currentLocale) {
      return false;
    }
    const localesForDomain = this.#domains[currentDomain];
    if (!localesForDomain) {
      return true;
    }
    return !localesForDomain.includes(currentLocale);
  }
}

class I18n {
  #i18n;
  #base;
  #trailingSlash;
  #format;
  #router;
  constructor(i18n, base, trailingSlash, format) {
    this.#i18n = i18n;
    this.#base = base;
    this.#trailingSlash = trailingSlash;
    this.#format = format;
    this.#router = new I18nRouter({
      strategy: i18n.strategy,
      defaultLocale: i18n.defaultLocale,
      locales: i18n.locales,
      base,
      domains: i18n.domainLookupTable ? Object.keys(i18n.domainLookupTable).reduce(
        (acc, domain) => {
          const locale = i18n.domainLookupTable[domain];
          if (!acc[domain]) {
            acc[domain] = [];
          }
          acc[domain].push(locale);
          return acc;
        },
        {}
      ) : void 0
    });
  }
  async finalize(state, response) {
    state.pipeline.usedFeatures |= PipelineFeatures.i18n;
    const i18n = this.#i18n;
    const typeHeader = response.headers.get(ROUTE_TYPE_HEADER);
    if (typeHeader) {
      response.headers.delete(ROUTE_TYPE_HEADER);
    }
    const isReroute = response.headers.get(REROUTE_DIRECTIVE_HEADER);
    if (isReroute === "no" && typeof i18n.fallback === "undefined") {
      return response;
    }
    if (typeHeader !== "page" && typeHeader !== "fallback") {
      return response;
    }
    const url = state.url;
    const currentLocale = state.computeCurrentLocale();
    const isPrerendered = state.routeData.prerender;
    const routerContext = {
      currentLocale,
      currentDomain: url.hostname,
      routeType: typeHeader,
      isReroute: isReroute === "yes"
    };
    const routeDecision = this.#router.match(url.pathname, routerContext);
    switch (routeDecision.type) {
      case "redirect": {
        let location = routeDecision.location;
        if (shouldAppendForwardSlash(this.#trailingSlash, this.#format)) {
          location = appendForwardSlash(location);
        }
        return new Response(null, {
          status: routeDecision.status ?? 302,
          headers: { Location: location }
        });
      }
      case "notFound": {
        if (isPrerendered) {
          const prerenderedRes = new Response(response.body, {
            status: 404,
            headers: response.headers
          });
          prerenderedRes.headers.set(REROUTE_DIRECTIVE_HEADER, "no");
          if (routeDecision.location) {
            prerenderedRes.headers.set("Location", routeDecision.location);
          }
          return prerenderedRes;
        }
        const headers = new Headers();
        if (routeDecision.location) {
          headers.set("Location", routeDecision.location);
        }
        return new Response(null, { status: 404, headers });
      }
    }
    if (i18n.fallback && i18n.fallbackType) {
      const effectiveStatus = typeHeader === "fallback" ? 404 : response.status;
      const fallbackDecision = computeFallbackRoute({
        pathname: url.pathname,
        responseStatus: effectiveStatus,
        fallback: i18n.fallback,
        fallbackType: i18n.fallbackType,
        locales: i18n.locales,
        defaultLocale: i18n.defaultLocale,
        strategy: i18n.strategy,
        base: this.#base
      });
      switch (fallbackDecision.type) {
        case "redirect":
          return new Response(null, {
            status: 302,
            headers: { Location: fallbackDecision.pathname + url.search }
          });
        case "rewrite":
          return await state.rewrite(fallbackDecision.pathname + url.search);
      }
    }
    return response;
  }
}

function pathHasLocale(path, locales) {
  const segments = path.split("/").map(normalizeThePath);
  for (const segment of segments) {
    for (const locale of locales) {
      if (typeof locale === "string") {
        if (normalizeTheLocale(segment) === normalizeTheLocale(locale)) {
          return true;
        }
      } else if (segment === locale.path) {
        return true;
      }
    }
  }
  return false;
}
function getPathByLocale(locale, locales) {
  for (const loopLocale of locales) {
    if (typeof loopLocale === "string") {
      if (loopLocale === locale) {
        return loopLocale;
      }
    } else {
      for (const code of loopLocale.codes) {
        if (code === locale) {
          return loopLocale.path;
        }
      }
    }
  }
  throw new AstroError(i18nNoLocaleFoundInPath);
}
function normalizeTheLocale(locale) {
  return locale.replaceAll("_", "-").toLowerCase();
}
function normalizeThePath(path) {
  return path.endsWith(".html") ? path.slice(0, -5) : path;
}
function getAllCodes(locales) {
  const result = [];
  for (const loopLocale of locales) {
    if (typeof loopLocale === "string") {
      result.push(loopLocale);
    } else {
      result.push(...loopLocale.codes);
    }
  }
  return result;
}

function parseLocale(header) {
  if (header === "*") {
    return [{ locale: header, qualityValue: void 0 }];
  }
  const result = [];
  const localeValues = header.split(",").map((str) => str.trim());
  for (const localeValue of localeValues) {
    const split = localeValue.split(";").map((str) => str.trim());
    const localeName = split[0];
    const qualityValue = split[1];
    if (!split) {
      continue;
    }
    if (qualityValue && qualityValue.startsWith("q=")) {
      const qualityValueAsFloat = Number.parseFloat(qualityValue.slice("q=".length));
      if (Number.isNaN(qualityValueAsFloat) || qualityValueAsFloat > 1) {
        result.push({
          locale: localeName,
          qualityValue: void 0
        });
      } else {
        result.push({
          locale: localeName,
          qualityValue: qualityValueAsFloat
        });
      }
    } else {
      result.push({
        locale: localeName,
        qualityValue: void 0
      });
    }
  }
  return result;
}
function sortAndFilterLocales(browserLocaleList, locales) {
  const normalizedLocales = getAllCodes(locales).map(normalizeTheLocale);
  return browserLocaleList.filter((browserLocale) => {
    if (browserLocale.locale !== "*") {
      return normalizedLocales.includes(normalizeTheLocale(browserLocale.locale));
    }
    return true;
  }).sort((a, b) => {
    if (a.qualityValue && b.qualityValue) {
      return Math.sign(b.qualityValue - a.qualityValue);
    }
    return 0;
  });
}
function computePreferredLocale(request, locales) {
  const acceptHeader = request.headers.get("Accept-Language");
  let result = void 0;
  if (acceptHeader) {
    const browserLocaleList = sortAndFilterLocales(parseLocale(acceptHeader), locales);
    const firstResult = browserLocaleList.at(0);
    if (firstResult && firstResult.locale !== "*") {
      outer: for (const currentLocale of locales) {
        if (typeof currentLocale === "string") {
          if (normalizeTheLocale(currentLocale) === normalizeTheLocale(firstResult.locale)) {
            result = currentLocale;
            break;
          }
        } else {
          for (const currentCode of currentLocale.codes) {
            if (normalizeTheLocale(currentCode) === normalizeTheLocale(firstResult.locale)) {
              result = currentCode;
              break outer;
            }
          }
        }
      }
    }
  }
  return result;
}
function computePreferredLocaleList(request, locales) {
  const acceptHeader = request.headers.get("Accept-Language");
  let result = [];
  if (acceptHeader) {
    const browserLocaleList = sortAndFilterLocales(parseLocale(acceptHeader), locales);
    if (browserLocaleList.length === 1 && browserLocaleList.at(0).locale === "*") {
      return getAllCodes(locales);
    } else if (browserLocaleList.length > 0) {
      for (const browserLocale of browserLocaleList) {
        for (const loopLocale of locales) {
          if (typeof loopLocale === "string") {
            if (normalizeTheLocale(loopLocale) === normalizeTheLocale(browserLocale.locale)) {
              result.push(loopLocale);
            }
          } else {
            for (const code of loopLocale.codes) {
              if (code === browserLocale.locale) {
                result.push(code);
              }
            }
          }
        }
      }
    }
  }
  return result;
}
function computeCurrentLocale(pathname, locales, defaultLocale) {
  for (const segment of pathname.split("/").map(normalizeThePath)) {
    for (const locale of locales) {
      if (typeof locale === "string") {
        if (!segment.includes(locale)) continue;
        if (normalizeTheLocale(locale) === normalizeTheLocale(segment)) {
          return locale;
        }
      } else {
        if (locale.path === segment) {
          return locale.codes.at(0);
        } else {
          for (const code of locale.codes) {
            if (normalizeTheLocale(code) === normalizeTheLocale(segment)) {
              return code;
            }
          }
        }
      }
    }
  }
  for (const locale of locales) {
    if (typeof locale === "string") {
      if (locale === defaultLocale) {
        return locale;
      }
    } else {
      if (locale.path === defaultLocale) {
        return locale.codes.at(0);
      }
    }
  }
}
function computeCurrentLocaleFromParams(params, locales) {
  const byNormalizedCode = /* @__PURE__ */ new Map();
  const byPath = /* @__PURE__ */ new Map();
  for (const locale of locales) {
    if (typeof locale === "string") {
      byNormalizedCode.set(normalizeTheLocale(locale), locale);
    } else {
      byPath.set(locale.path, locale.codes[0]);
      for (const code of locale.codes) {
        byNormalizedCode.set(normalizeTheLocale(code), code);
      }
    }
  }
  for (const value of Object.values(params)) {
    if (!value) continue;
    const pathMatch = byPath.get(value);
    if (pathMatch) return pathMatch;
    const codeMatch = byNormalizedCode.get(normalizeTheLocale(value));
    if (codeMatch) return codeMatch;
  }
}

async function callMiddleware(onRequest, apiContext, responseFunction) {
  let nextCalled = false;
  let responseFunctionPromise = void 0;
  const next = async (payload) => {
    nextCalled = true;
    responseFunctionPromise = responseFunction(apiContext, payload);
    return responseFunctionPromise;
  };
  const middlewarePromise = onRequest(apiContext, next);
  return await Promise.resolve(middlewarePromise).then(async (value) => {
    if (nextCalled) {
      if (typeof value !== "undefined") {
        if (value instanceof Response === false) {
          throw new AstroError(MiddlewareNotAResponse);
        }
        return value;
      } else {
        if (responseFunctionPromise) {
          return responseFunctionPromise;
        } else {
          throw new AstroError(MiddlewareNotAResponse);
        }
      }
    } else if (typeof value === "undefined") {
      throw new AstroError(MiddlewareNoDataOrNextCalled);
    } else if (value instanceof Response === false) {
      throw new AstroError(MiddlewareNotAResponse);
    } else {
      return value;
    }
  });
}

const EMPTY_OPTIONS = Object.freeze({ tags: [] });
class NoopAstroCache {
  enabled = false;
  set() {
  }
  get tags() {
    return [];
  }
  get options() {
    return EMPTY_OPTIONS;
  }
  async invalidate() {
  }
}
let hasWarned = false;
class DisabledAstroCache {
  enabled = false;
  #logger;
  constructor(logger) {
    this.#logger = logger;
  }
  #warn() {
    if (!hasWarned) {
      hasWarned = true;
      this.#logger?.warn(
        "cache",
        "`cache.set()` was called but caching is not enabled. Configure a cache provider in your Astro config under `experimental.cache` to enable caching."
      );
    }
  }
  set() {
    this.#warn();
  }
  get tags() {
    return [];
  }
  get options() {
    return EMPTY_OPTIONS;
  }
  async invalidate() {
    throw new AstroError(CacheNotEnabled);
  }
}

class AstroMiddleware {
  #pipeline;
  constructor(pipeline) {
    this.#pipeline = pipeline;
  }
  async handle(state, renderRouteCallback) {
    state.pipeline.usedFeatures |= PipelineFeatures.middleware;
    const pipeline = this.#pipeline;
    await state.getProps();
    const apiContext = state.getAPIContext();
    state.counter++;
    if (state.counter === 4) {
      return new Response("Loop Detected", {
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/508
        status: 508,
        statusText: "Astro detected a loop where you tried to call the rewriting logic more than four times."
      });
    }
    const next = async (ctx, payload) => {
      if (payload) {
        pipeline.logger.debug("router", "Called rewriting to:", payload);
        const result = await pipeline.tryRewrite(payload, state.request);
        applyRewriteToState(state, payload, result);
      }
      return renderRouteCallback(state, ctx);
    };
    let response;
    if (state.skipMiddleware) {
      response = await next(apiContext);
    } else {
      const pipelineMiddleware = await pipeline.getMiddleware();
      const composed = sequence(...pipeline.internalMiddleware, pipelineMiddleware);
      response = await callMiddleware(composed, apiContext, next);
    }
    response = this.#finalize(state, response);
    state.response = response;
    return response;
  }
  #finalize(state, response) {
    attachCookiesToResponse(response, state.cookies);
    return response;
  }
}

const EMPTY_SLOTS = Object.freeze({});
class PagesHandler {
  #pipeline;
  constructor(pipeline) {
    this.#pipeline = pipeline;
  }
  async handle(state, ctx) {
    const pipeline = this.#pipeline;
    const { logger, streaming } = pipeline;
    let response;
    const componentInstance = await state.loadComponentInstance();
    switch (state.routeData.type) {
      case "endpoint": {
        response = await renderEndpoint(
          componentInstance,
          ctx,
          state.routeData.prerender,
          logger
        );
        break;
      }
      case "page": {
        const props = await state.getProps();
        const actionApiContext = state.getActionAPIContext();
        const result = await state.createResult(componentInstance, actionApiContext);
        try {
          response = await renderPage(
            result,
            componentInstance?.default,
            props,
            state.slots ?? EMPTY_SLOTS,
            streaming,
            state.routeData
          );
        } catch (e) {
          result.cancelled = true;
          throw e;
        }
        response.headers.set(ROUTE_TYPE_HEADER, "page");
        if (state.routeData.route === "/404" || state.routeData.route === "/500") {
          response.headers.set(REROUTE_DIRECTIVE_HEADER, "no");
        }
        if (state.isRewriting) {
          response.headers.set(REWRITE_DIRECTIVE_HEADER_KEY, REWRITE_DIRECTIVE_HEADER_VALUE);
        }
        break;
      }
      case "redirect": {
        return new Response(null, { status: 404, headers: { [ASTRO_ERROR_HEADER]: "true" } });
      }
      case "fallback": {
        return new Response(null, { status: 500, headers: { [ROUTE_TYPE_HEADER]: "fallback" } });
      }
    }
    const responseCookies = getCookiesFromResponse(response);
    if (responseCookies) {
      state.cookies.merge(responseCookies);
    }
    state.response = response;
    return response;
  }
}

function createNormalizedUrl(requestUrl) {
  return normalizeUrl(new URL(requestUrl));
}
function normalizeUrl(url) {
  try {
    url.pathname = validateAndDecodePathname(url.pathname);
  } catch {
    try {
      url.pathname = decodeURI(url.pathname);
    } catch {
    }
  }
  url.pathname = collapseDuplicateSlashes(url.pathname);
  return url;
}

function applyRewriteToState(state, payload, { routeData, componentInstance, newUrl, pathname }, { mergeCookies = false } = {}) {
  const pipeline = state.pipeline;
  const oldPathname = state.pathname;
  const isI18nFallback = routeData.fallbackRoutes && routeData.fallbackRoutes.length > 0;
  if (pipeline.manifest.serverLike && !state.routeData.prerender && routeData.prerender && !isI18nFallback) {
    throw new AstroError({
      ...ForbiddenRewrite,
      message: ForbiddenRewrite.message(state.pathname, pathname, routeData.component),
      hint: ForbiddenRewrite.hint(routeData.component)
    });
  }
  state.routeData = routeData;
  state.componentInstance = componentInstance;
  if (payload instanceof Request) {
    state.request = payload;
  } else {
    state.request = copyRequest(
      newUrl,
      state.request,
      routeData.prerender,
      pipeline.logger,
      state.routeData.route
    );
  }
  state.url = createNormalizedUrl(state.request.url);
  if (mergeCookies) {
    const newCookies = new AstroCookies(state.request);
    if (state.cookies) {
      newCookies.merge(state.cookies);
    }
    state.cookies = newCookies;
  }
  state.params = getParams(routeData, pathname);
  state.pathname = pathname;
  state.isRewriting = true;
  state.status = 200;
  setOriginPathname(
    state.request,
    oldPathname,
    pipeline.manifest.trailingSlash,
    pipeline.manifest.buildFormat
  );
  state.invalidateContexts();
}
class Rewrites {
  async execute(state, payload) {
    const pipeline = state.pipeline;
    pipeline.logger.debug("router", "Calling rewrite: ", payload);
    const result = await pipeline.tryRewrite(payload, state.request);
    applyRewriteToState(state, payload, result, { mergeCookies: true });
    const middleware = new AstroMiddleware(pipeline);
    const pagesHandler = new PagesHandler(pipeline);
    return middleware.handle(state, pagesHandler.handle.bind(pagesHandler));
  }
}

function matchRoute(pathname, manifest) {
  if (isRoute404(pathname)) {
    const errorRoute = manifest.routes.find((route) => isRoute404(route.route));
    if (errorRoute) return errorRoute;
  }
  if (isRoute500(pathname)) {
    const errorRoute = manifest.routes.find((route) => isRoute500(route.route));
    if (errorRoute) return errorRoute;
  }
  return manifest.routes.find((route) => {
    return route.pattern.test(pathname) || route.fallbackRoutes.some((fallbackRoute) => fallbackRoute.pattern.test(pathname));
  });
}
function isRoute404or500(route) {
  return isRoute404(route.route) || isRoute500(route.route);
}
function isRouteServerIsland(route) {
  return route.component === SERVER_ISLAND_COMPONENT;
}

function computePathnameFromDomain(request, url, i18n, base, trailingSlash, logger) {
  let pathname = void 0;
  if (i18n && (i18n.strategy === "domains-prefix-always" || i18n.strategy === "domains-prefix-other-locales" || i18n.strategy === "domains-prefix-always-no-redirect")) {
    let host = request.headers.get("X-Forwarded-Host");
    let protocol = request.headers.get("X-Forwarded-Proto");
    if (protocol) {
      protocol = protocol + ":";
    } else {
      protocol = url.protocol;
    }
    if (!host) {
      host = request.headers.get("Host");
    }
    if (host && protocol) {
      host = host.split(":")[0];
      try {
        let locale;
        const hostAsUrl = new URL(`${protocol}//${host}`);
        for (const [domainKey, localeValue] of Object.entries(i18n.domainLookupTable)) {
          const domainKeyAsUrl = new URL(domainKey);
          if (hostAsUrl.host === domainKeyAsUrl.host && hostAsUrl.protocol === domainKeyAsUrl.protocol) {
            locale = localeValue;
            break;
          }
        }
        if (locale) {
          pathname = prependForwardSlash(
            joinPaths(normalizeTheLocale(locale), removeBase(url.pathname, base))
          );
          if (trailingSlash === "always") {
            pathname = appendForwardSlash(pathname);
          } else if (trailingSlash === "never") {
            pathname = removeTrailingForwardSlash(pathname);
          } else if (url.pathname.endsWith("/")) {
            pathname = appendForwardSlash(pathname);
          }
        }
      } catch (e) {
        logger.error(
          "router",
          `Astro tried to parse ${protocol}//${host} as an URL, but it threw a parsing error. Check the X-Forwarded-Host and X-Forwarded-Proto headers.`
        );
        logger.error("router", `Error: ${e}`);
      }
    }
  }
  return pathname;
}
function removeBase(pathname, base) {
  pathname = collapseDuplicateLeadingSlashes(pathname);
  if (pathname.startsWith(base)) {
    return pathname.slice(removeTrailingForwardSlash(base).length + 1);
  }
  return pathname;
}

const renderOptionsSymbol = /* @__PURE__ */ Symbol.for("astro.renderOptions");
function getRenderOptions(request) {
  return Reflect.get(request, renderOptionsSymbol);
}
function setRenderOptions(request, options) {
  Reflect.set(request, renderOptionsSymbol, options);
}

function getFirstForwardedValue$1(multiValueHeader) {
  return multiValueHeader?.toString().split(",").map((e) => e.trim())[0];
}
function sanitizeHost(hostname) {
  if (!hostname) return void 0;
  if (/[/\\]/.test(hostname)) return void 0;
  return hostname;
}
function parseHost(host) {
  const parts = host.split(":");
  return {
    hostname: parts[0],
    port: parts[1]
  };
}
function matchesAllowedDomains(hostname, protocol, port, allowedDomains) {
  const hostWithPort = port ? `${hostname}:${port}` : hostname;
  const urlString = `${protocol}://${hostWithPort}`;
  if (!URL.canParse(urlString)) {
    return false;
  }
  const testUrl = new URL(urlString);
  return allowedDomains.some((pattern) => matchPattern(testUrl, pattern));
}
function validateHost(host, protocol, allowedDomains) {
  if (!host || host.length === 0) return void 0;
  if (!allowedDomains || allowedDomains.length === 0) return void 0;
  const sanitized = sanitizeHost(host);
  if (!sanitized) return void 0;
  const { hostname, port } = parseHost(sanitized);
  if (matchesAllowedDomains(hostname, protocol, port, allowedDomains)) {
    return sanitized;
  }
  return void 0;
}
function validateForwardedHeaders(forwardedProtocol, forwardedHost, forwardedPort, allowedDomains) {
  const result = {};
  if (forwardedProtocol) {
    if (allowedDomains && allowedDomains.length > 0) {
      const hasProtocolPatterns = allowedDomains.some((pattern) => pattern.protocol !== void 0);
      if (hasProtocolPatterns) {
        try {
          const testUrl = new URL(`${forwardedProtocol}://example.com`);
          const isAllowed = allowedDomains.some(
            (pattern) => matchPattern(testUrl, { protocol: pattern.protocol })
          );
          if (isAllowed) {
            result.protocol = forwardedProtocol;
          }
        } catch {
        }
      } else if (/^https?$/.test(forwardedProtocol)) {
        result.protocol = forwardedProtocol;
      }
    }
  }
  if (forwardedPort && allowedDomains && allowedDomains.length > 0) {
    const hasPortPatterns = allowedDomains.some((pattern) => pattern.port !== void 0);
    if (hasPortPatterns) {
      const isAllowed = allowedDomains.some((pattern) => pattern.port === forwardedPort);
      if (isAllowed) {
        result.port = forwardedPort;
      }
    }
  }
  if (forwardedHost && forwardedHost.length > 0 && allowedDomains && allowedDomains.length > 0) {
    const protoForValidation = result.protocol || "https";
    const sanitized = sanitizeHost(forwardedHost);
    if (sanitized) {
      const { hostname, port: portFromHost } = parseHost(sanitized);
      const portForValidation = result.port || portFromHost;
      if (matchesAllowedDomains(hostname, protoForValidation, portForValidation, allowedDomains)) {
        result.host = sanitized;
      }
    }
  }
  return result;
}

class FetchState {
  pipeline;
  /**
   * The request to render. Mutated during rewrites so subsequent renders
   * see the rewritten URL.
   */
  request;
  routeData;
  /**
   * The pathname to use for routing and rendering. Starts out as the raw,
   * base-stripped, decoded pathname from the request. May be further
   * normalized by `AstroHandler` after routeData is known (in dev, when
   * the matched route has no `.html` extension, `.html` / `/index.html`
   * suffixes are stripped).
   */
  pathname;
  /** Resolved render options (addCookieHeader, clientAddress, locals, etc.). */
  renderOptions;
  /** When the request started, used to log duration. */
  timeStart;
  /**
   * The route's loaded component module. Set before middleware runs; may
   * be swapped during in-flight rewrites from inside the middleware chain.
   */
  componentInstance;
  /**
   * Slot overrides supplied by the container API. `undefined` for HTTP
   * requests — `PagesHandler` coalesces to `{}` on read so we don't
   * allocate an empty object per request.
   */
  slots;
  /**
   * The `Response` produced by handlers, if any. Set after page
   * rendering or middleware completes.
   */
  response;
  /**
   * Default HTTP status for the rendered response. Callers override
   * before rendering runs (e.g. `AstroHandler` sets this from
   * `BaseApp.getDefaultStatusCode`; error handlers set `404` / `500`).
   */
  status = 200;
  /** Whether user middleware should be skipped for this request. */
  skipMiddleware = false;
  /**
   * Set to `true` when the request path was encoded too many times to fully
   * decode (see {@link validateAndDecodePathname}). These requests are
   * rejected with a `400` before middleware or routing run.
   */
  invalidEncoding = false;
  /** A flag that tells the render content if the rewriting was triggered. */
  isRewriting = false;
  /** A safety net in case of loops (rewrite counter). */
  counter = 0;
  /** Cookies for this request. Created lazily on first access. */
  cookies;
  /** Route params derived from routeData + pathname. Computed lazily. */
  #params;
  get params() {
    if (!this.#params && this.routeData) {
      this.#params = getParams(this.routeData, this.pathname);
    }
    return this.#params;
  }
  set params(value) {
    this.#params = value;
  }
  /** Normalized URL for this request. */
  url;
  /** Client address for this request. */
  clientAddress;
  /** Whether this is a partial render (container API). */
  partial;
  /** Whether to inject CSP meta tags. */
  shouldInjectCspMetaTags;
  /** Request-scoped locals object, shared with user middleware. */
  locals = {};
  /**
   * Memoized `props` (see `getProps`). `null` means "not yet computed"
   * — using `null` (rather than `undefined`) keeps the hidden class
   * stable and distinct from a valid-but-empty result.
   */
  props = null;
  /** Memoized `ActionAPIContext` (see `getActionAPIContext`). */
  actionApiContext = null;
  /** Memoized `APIContext` (see `getAPIContext`). */
  apiContext = null;
  /** Registered context providers keyed by name. Lazy-initialized on first provide(). */
  #providers;
  /** Cached values from resolved providers. Lazy-initialized on first resolve(). */
  #providersResolvedValues;
  /** Cached promise for lazy component instance loading. */
  #componentInstancePromise;
  /** SSR result for the current page render. */
  result;
  /** Initial props (from container/error handler). */
  initialProps = {};
  /** Rewrites handler instance. Lazy-initialized on first rewrite(). */
  #rewrites;
  /** Memoized Astro page partial. */
  #astroPagePartial;
  /**
   * Locale-prefixed pathname derived from the Host header for domain-based
   * i18n routing (e.g. `/en/boats/1/foo`), or `undefined` when the request
   * isn't served from a locale-mapped domain. When set, `this.pathname` is
   * derived from it so locale/param resolution match the route pattern.
   */
  #domainPathname;
  /** Memoized current locale. */
  #currentLocale;
  /** Memoized preferred locale. */
  #preferredLocale;
  /** Memoized preferred locale list. */
  #preferredLocaleList;
  constructor(pipeline, request, options) {
    this.pipeline = pipeline;
    this.request = request;
    options ??= getRenderOptions(request);
    this.routeData = options?.routeData;
    this.renderOptions = options ?? {
      addCookieHeader: false,
      clientAddress: void 0,
      locals: void 0,
      prerenderedErrorPageFetch: fetch,
      routeData: void 0,
      waitUntil: void 0
    };
    this.componentInstance = void 0;
    this.slots = void 0;
    const url = new URL(request.url);
    const domainPathname = computePathnameFromDomain(
      request,
      url,
      pipeline.manifest.i18n,
      pipeline.manifest.base,
      pipeline.manifest.trailingSlash,
      pipeline.logger
    );
    if (domainPathname) {
      this.#domainPathname = domainPathname;
      try {
        this.pathname = decodeURI(domainPathname);
      } catch {
        this.pathname = domainPathname;
      }
    } else {
      this.pathname = this.#computePathname(url);
    }
    this.timeStart = performance.now();
    this.clientAddress = options?.clientAddress;
    this.locals = options?.locals ?? {};
    this.url = normalizeUrl(url);
    this.cookies = new AstroCookies(request);
    if (pipeline.manifest.allowedDomains && pipeline.manifest.allowedDomains.length > 0) {
      this.#applyForwardedHeaders();
    }
    if (!Reflect.get(this.request, originPathnameSymbol)) {
      setOriginPathname(
        this.request,
        this.pathname,
        pipeline.manifest.trailingSlash,
        pipeline.manifest.buildFormat
      );
    }
    this.#resolveRouteData();
  }
  /**
   * Triggers a rewrite. Delegates to the Rewrites handler.
   */
  rewrite(payload) {
    return (this.#rewrites ??= new Rewrites()).execute(this, payload);
  }
  /**
   * Creates the SSR result for the current page render.
   */
  async createResult(mod, ctx) {
    const pipeline = this.pipeline;
    const { clientDirectives, inlinedScripts, compressHTML, manifest, renderers, resolve } = pipeline;
    const routeData = this.routeData;
    const { links, scripts, styles } = await pipeline.headElements(routeData);
    const extraStyleHashes = [];
    const extraScriptHashes = [];
    const shouldInjectCspMetaTags = this.shouldInjectCspMetaTags ?? manifest.shouldInjectCspMetaTags;
    const cspAlgorithm = manifest.csp?.algorithm ?? "SHA-256";
    if (shouldInjectCspMetaTags) {
      for (const style of styles) {
        extraStyleHashes.push(await generateCspDigest(style.children, cspAlgorithm));
      }
      for (const script of scripts) {
        extraScriptHashes.push(await generateCspDigest(script.children, cspAlgorithm));
      }
    }
    const componentMetadata = await pipeline.componentMetadata(routeData) ?? manifest.componentMetadata;
    const headers = new Headers({ "Content-Type": "text/html" });
    const partial = typeof this.partial === "boolean" ? this.partial : Boolean(mod.partial);
    const actionResult = hasActionPayload(this.locals) ? deserializeActionResult(this.locals._actionPayload.actionResult) : void 0;
    const status = this.status;
    const response = {
      status: actionResult?.error ? actionResult?.error.status : status,
      statusText: actionResult?.error ? actionResult?.error.type : "OK",
      get headers() {
        return headers;
      },
      set headers(_) {
        throw new AstroError(AstroResponseHeadersReassigned);
      }
    };
    const state = this;
    const result = {
      base: manifest.base,
      userAssetsBase: manifest.userAssetsBase,
      cancelled: false,
      clientDirectives,
      inlinedScripts,
      componentMetadata,
      compressHTML,
      cookies: this.cookies,
      createAstro: (props, slots) => state.createAstro(result, props, slots, ctx),
      links,
      // SAFETY: createResult is only called after route resolution, so routeData
      // is always set and the params getter always returns a value.
      params: this.params,
      partial,
      pathname: this.pathname,
      renderers,
      resolve,
      response,
      request: this.request,
      scripts,
      styles,
      actionResult,
      async getServerIslandNameMap() {
        const serverIslands = await pipeline.getServerIslands();
        return serverIslands.serverIslandNameMap ?? /* @__PURE__ */ new Map();
      },
      key: manifest.key,
      trailingSlash: manifest.trailingSlash,
      _experimentalQueuedRendering: {
        pool: pipeline.nodePool,
        htmlStringCache: pipeline.htmlStringCache,
        enabled: manifest.experimentalQueuedRendering?.enabled,
        poolSize: manifest.experimentalQueuedRendering?.poolSize,
        contentCache: manifest.experimentalQueuedRendering?.contentCache
      },
      _metadata: {
        hasHydrationScript: false,
        rendererSpecificHydrationScripts: /* @__PURE__ */ new Set(),
        hasRenderedHead: false,
        renderedScripts: /* @__PURE__ */ new Set(),
        hasDirectives: /* @__PURE__ */ new Set(),
        hasRenderedServerIslandRuntime: false,
        headInTree: false,
        extraHead: [],
        extraStyleHashes,
        extraScriptHashes,
        propagators: /* @__PURE__ */ new Set(),
        templateDepth: 0
      },
      cspDestination: manifest.csp?.cspDestination ?? (routeData.prerender ? "meta" : "header"),
      shouldInjectCspMetaTags,
      cspAlgorithm,
      scriptHashes: manifest.csp?.scriptHashes ? [...manifest.csp.scriptHashes] : [],
      scriptResources: manifest.csp?.scriptResources ? [...manifest.csp.scriptResources] : [],
      styleHashes: manifest.csp?.styleHashes ? [...manifest.csp.styleHashes] : [],
      styleResources: manifest.csp?.styleResources ? [...manifest.csp.styleResources] : [],
      directives: manifest.csp?.directives ? [...manifest.csp.directives] : [],
      isStrictDynamic: manifest.csp?.isStrictDynamic ?? false,
      internalFetchHeaders: manifest.internalFetchHeaders
    };
    this.result = result;
    return result;
  }
  /**
   * Creates the Astro global object for a component render.
   */
  createAstro(result, props, slotValues, apiContext) {
    let astroPagePartial;
    if (this.isRewriting) {
      this.#astroPagePartial = this.createAstroPagePartial(result, apiContext);
    }
    this.#astroPagePartial ??= this.createAstroPagePartial(result, apiContext);
    astroPagePartial = this.#astroPagePartial;
    const astroComponentPartial = { props, self: null };
    const Astro = Object.assign(
      Object.create(astroPagePartial),
      astroComponentPartial
    );
    let _slots;
    Object.defineProperty(Astro, "slots", {
      get: () => {
        if (!_slots) {
          _slots = new Slots(
            result,
            slotValues,
            this.pipeline.logger
          );
        }
        return _slots;
      }
    });
    return Astro;
  }
  /**
   * Creates the Astro page-level partial (prototype for Astro global).
   */
  createAstroPagePartial(result, apiContext) {
    const state = this;
    const { cookies, locals, params, pipeline, url } = this;
    const { response } = result;
    const redirect = (path, status = 302) => {
      if (state.request[responseSentSymbol$1]) {
        throw new AstroError({
          ...ResponseSentError
        });
      }
      return new Response(null, { status, headers: { Location: path } });
    };
    const rewrite = async (reroutePayload) => {
      return await state.rewrite(reroutePayload);
    };
    const callAction = createCallAction(apiContext);
    const partial = {
      generator: ASTRO_GENERATOR,
      routePattern: this.routeData.route,
      isPrerendered: this.routeData.prerender,
      cookies,
      get clientAddress() {
        return state.getClientAddress();
      },
      get currentLocale() {
        return state.computeCurrentLocale();
      },
      params,
      get preferredLocale() {
        return state.computePreferredLocale();
      },
      get preferredLocaleList() {
        return state.computePreferredLocaleList();
      },
      locals,
      redirect,
      rewrite,
      request: this.request,
      response,
      site: pipeline.site,
      getActionResult: createGetActionResult(locals),
      get callAction() {
        return callAction;
      },
      url,
      get originPathname() {
        return getOriginPathname(state.request);
      },
      get csp() {
        return state.getCsp();
      },
      get logger() {
        return {
          info(msg) {
            pipeline.logger.info(null, msg);
          },
          warn(msg) {
            pipeline.logger.warn(null, msg);
          },
          error(msg) {
            pipeline.logger.error(null, msg);
          }
        };
      }
    };
    this.defineProviderGetters(partial);
    return partial;
  }
  getClientAddress() {
    const { pipeline, clientAddress } = this;
    const routeData = this.routeData;
    if (routeData.prerender) {
      throw new AstroError({
        ...PrerenderClientAddressNotAvailable,
        message: PrerenderClientAddressNotAvailable.message(routeData.component)
      });
    }
    if (clientAddress) {
      return clientAddress;
    }
    if (pipeline.adapterName) {
      throw new AstroError({
        ...ClientAddressNotAvailable,
        message: ClientAddressNotAvailable.message(pipeline.adapterName)
      });
    }
    throw new AstroError(StaticClientAddressNotAvailable);
  }
  getCookies() {
    return this.cookies;
  }
  getCsp() {
    const state = this;
    const { pipeline } = this;
    if (!pipeline.manifest.csp) {
      if (pipeline.runtimeMode === "production") {
        pipeline.logger.warn(
          "csp",
          `context.csp was used when rendering the route ${colors.green(state.routeData.route)}, but CSP was not configured. For more information, see https://docs.astro.build/en/reference/configuration-reference/#securitycsp`
        );
      }
      return void 0;
    }
    return {
      insertDirective(payload) {
        if (state.result) {
          state.result.directives = pushDirective(state.result.directives, payload);
        }
      },
      insertScriptResource(resource) {
        state.result?.scriptResources.push(resource);
      },
      insertStyleResource(resource) {
        state.result?.styleResources.push(resource);
      },
      insertStyleHash(hash) {
        state.result?.styleHashes.push(hash);
      },
      insertScriptHash(hash) {
        state.result?.scriptHashes.push(hash);
      }
    };
  }
  computeCurrentLocale() {
    const {
      url,
      pipeline: { i18n },
      routeData
    } = this;
    if (!i18n || !routeData) return;
    const { defaultLocale, locales, strategy } = i18n;
    const fallbackTo = strategy === "pathname-prefix-other-locales" || strategy === "domains-prefix-other-locales" ? defaultLocale : void 0;
    if (this.#currentLocale) {
      return this.#currentLocale;
    }
    let computedLocale;
    if (isRouteServerIsland(routeData)) {
      let referer = this.request.headers.get("referer");
      if (referer) {
        if (URL.canParse(referer)) {
          referer = new URL(referer).pathname;
        }
        computedLocale = computeCurrentLocale(referer, locales, defaultLocale);
      }
    } else {
      let pathname = routeData.pathname;
      if (this.#domainPathname) {
        pathname = this.pathname;
      } else if (url && !routeData.pattern.test(url.pathname)) {
        for (const fallbackRoute of routeData.fallbackRoutes) {
          if (fallbackRoute.pattern.test(url.pathname)) {
            pathname = fallbackRoute.pathname;
            break;
          }
        }
      }
      pathname = pathname && !isRoute404or500(routeData) ? pathname : url.pathname ?? this.pathname;
      computedLocale = computeCurrentLocale(pathname, locales, defaultLocale);
      if (routeData.params.length > 0) {
        const localeFromParams = computeCurrentLocaleFromParams(this.params, locales);
        if (localeFromParams) {
          computedLocale = localeFromParams;
        }
      }
    }
    this.#currentLocale = computedLocale ?? fallbackTo;
    return this.#currentLocale;
  }
  computePreferredLocale() {
    const {
      pipeline: { i18n },
      request
    } = this;
    if (!i18n) return;
    return this.#preferredLocale ??= computePreferredLocale(request, i18n.locales);
  }
  computePreferredLocaleList() {
    const {
      pipeline: { i18n },
      request
    } = this;
    if (!i18n) return;
    return this.#preferredLocaleList ??= computePreferredLocaleList(request, i18n.locales);
  }
  /**
   * Lazily loads the route's component module. Returns the cached
   * instance if already loaded. The promise is cached so concurrent
   * callers share the same load.
   */
  async loadComponentInstance() {
    if (this.componentInstance) return this.componentInstance;
    if (this.#componentInstancePromise) return this.#componentInstancePromise;
    this.#componentInstancePromise = this.pipeline.getComponentByRoute(this.routeData).then((mod) => {
      this.componentInstance = mod;
      return mod;
    });
    return this.#componentInstancePromise;
  }
  /**
   * Registers a context provider under the given key. Handlers call
   * this to contribute values to the request context (e.g. sessions).
   * The `create` factory is called lazily on the first `resolve(key)`.
   */
  provide(key, provider) {
    (this.#providers ??= /* @__PURE__ */ new Map()).set(key, provider);
  }
  /**
   * Lazily resolves a provider registered under `key`. Calls
   * `provider.create()` on first access and caches the result.
   * Returns `undefined` if no provider was registered for the key.
   */
  resolve(key) {
    if (this.#providersResolvedValues?.has(key)) {
      return this.#providersResolvedValues.get(key);
    }
    const provider = this.#providers?.get(key);
    if (!provider) return void 0;
    const value = provider.create();
    (this.#providersResolvedValues ??= /* @__PURE__ */ new Map()).set(key, value);
    return value;
  }
  /**
   * Runs all registered `finalize` callbacks. Should be called after
   * the response is produced, typically in a `finally` block.
   *
   * Returns synchronously (no promise allocation) when nothing needs
   * finalizing — important for the hot path where sessions are not used.
   */
  finalizeAll() {
    if (!this.#providersResolvedValues || this.#providersResolvedValues.size === 0) return;
    let chain;
    for (const [key, provider] of this.#providers) {
      if (provider.finalize && this.#providersResolvedValues.has(key)) {
        const result = provider.finalize(this.#providersResolvedValues.get(key));
        if (result) {
          chain = chain ? chain.then(() => result) : result;
        }
      }
    }
    return chain;
  }
  /**
   * Adds lazy getters to `target` for each registered provider key.
   * Used by context creation (APIContext, Astro global) so that
   * provider values like `session` and `cache` appear as properties
   * without hard-coding the keys.
   */
  defineProviderGetters(target) {
    if (!this.#providers) return;
    const state = this;
    for (const key of this.#providers.keys()) {
      Object.defineProperty(target, key, {
        get: () => state.resolve(key),
        enumerable: true,
        configurable: true
      });
    }
  }
  /**
   * Resolves the route to use for this request and stores it on
   * `this.routeData`. If the adapter (or the dev server) provided a
   * `routeData` via render options it's already set and this is a
   * no-op. Otherwise we use the app's synchronous route matcher and
   * fall back to a `404.astro` route so middleware can still run.
   *
   * Called eagerly from the constructor so individual handlers
   * (actions, pages, middleware, etc.) always see a resolved route
   * without the caller needing an extra setup step.
   *
   * Once routeData is known, finalizes `this.pathname`: in dev, if the
   * matched route has no `.html` extension, strip `.html` / `/index.html`
   * suffixes so the rendering pipeline sees the canonical pathname.
   */
  /**
   * Strip `.html` / `/index.html` suffixes from the pathname so the
   * rendering pipeline sees the canonical route path. Only applies to
   * page routes where `.html` is framework-injected. Endpoint routes
   * preserve `.html` because any such suffix is user-provided (e.g.
   * from `getStaticPaths` params). Skipped when the matched route
   * itself has an `.html` extension in its definition.
   */
  #stripHtmlExtension() {
    if (this.routeData && this.routeData.type === "page" && !routeHasHtmlExtension(this.routeData)) {
      this.pathname = this.pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
    }
  }
  #resolveRouteData() {
    const pipeline = this.pipeline;
    if (this.routeData) {
      this.#stripHtmlExtension();
      return;
    }
    const matched = pipeline.matchRoute(this.pathname);
    if (matched && matched.prerender && pipeline.manifest.serverLike) {
      if (matched.params.length > 0) {
        const allMatches = pipeline.matchAllRoutes(this.pathname);
        this.routeData = allMatches.find((r) => !r.prerender);
      } else {
        this.routeData = void 0;
      }
    } else {
      this.routeData = matched;
    }
    pipeline.logger.debug("router", "Astro matched the following route for " + this.request.url);
    pipeline.logger.debug("router", "RouteData:\n" + this.routeData);
    if (!this.routeData) {
      const custom404 = getCustom404Route(pipeline.manifestData);
      if (custom404 && !custom404.prerender) {
        this.routeData = custom404;
      }
    }
    if (!this.routeData) {
      pipeline.logger.debug("router", "Astro hasn't found routes that match " + this.request.url);
      pipeline.logger.debug("router", "Here's the available routes:\n", pipeline.manifestData);
      return;
    }
    this.#stripHtmlExtension();
  }
  /**
   * Strips the pipeline's base from the request URL, prepends a forward
   * slash, and decodes the pathname. Falls back to the raw (not decoded)
   * pathname if `decodeURI` throws.
   *
   * Mirrors `BaseApp.removeBase`, including the
   * `collapseDuplicateLeadingSlashes` fix that prevents middleware
   * authorization bypass when the URL starts with `//`.
   */
  #computePathname(url) {
    let pathname = collapseDuplicateLeadingSlashes(url.pathname);
    const base = this.pipeline.manifest.base;
    if (pathname.startsWith(base)) {
      const baseWithoutTrailingSlash = removeTrailingForwardSlash(base);
      pathname = pathname.slice(baseWithoutTrailingSlash.length + 1);
    }
    pathname = prependForwardSlash(pathname);
    try {
      return validateAndDecodePathname(pathname);
    } catch (e) {
      if (e instanceof MultiLevelEncodingError) {
        this.invalidEncoding = true;
        return pathname;
      }
      this.pipeline.logger.error(null, e.toString());
      return pathname;
    }
  }
  /**
   * Reads X-Forwarded-Proto, X-Forwarded-Host, and X-Forwarded-Port
   * from the request headers, validates them against the manifest's
   * `allowedDomains`, and updates `this.url` accordingly. Also resolves
   * `clientAddress` from X-Forwarded-For when the host is trusted.
   *
   * Only called when `allowedDomains` is configured — without it,
   * forwarded headers are never trusted.
   */
  #applyForwardedHeaders() {
    const headers = this.request.headers;
    const allowedDomains = this.pipeline.manifest.allowedDomains;
    const validated = validateForwardedHeaders(
      getFirstForwardedValue$1(headers.get("x-forwarded-proto") ?? void 0),
      getFirstForwardedValue$1(headers.get("x-forwarded-host") ?? void 0),
      getFirstForwardedValue$1(headers.get("x-forwarded-port") ?? void 0),
      allowedDomains
    );
    if (!validated.protocol && !validated.host && !validated.port) return;
    if (validated.protocol) {
      this.url.protocol = validated.protocol + ":";
    }
    if (validated.host) {
      const colonIdx = validated.host.indexOf(":");
      if (colonIdx !== -1) {
        this.url.hostname = validated.host.slice(0, colonIdx);
        this.url.port = validated.host.slice(colonIdx + 1);
      } else {
        this.url.hostname = validated.host;
        this.url.port = "";
      }
    }
    if (validated.port) {
      this.url.port = validated.port;
    }
    const hostTrusted = validated.host !== void 0;
    if (hostTrusted && !this.clientAddress) {
      const forwardedFor = getFirstForwardedValue$1(
        this.request.headers.get("x-forwarded-for") ?? void 0
      );
      if (forwardedFor) {
        this.clientAddress = forwardedFor;
      }
    }
    const oldRequest = this.request;
    this.request = new Request(this.url, oldRequest);
    const app = Reflect.get(oldRequest, appSymbol);
    if (app !== void 0) {
      Reflect.set(this.request, appSymbol, app);
    }
  }
  /**
   * Returns the resolved `props` for this render, computing them lazily
   * from the route + component module on first access. If the
   * `initialProps` already carries user-supplied props (e.g. the
   * container API) those are used verbatim.
   */
  async getProps() {
    if (this.props !== null) return this.props;
    if (Object.keys(this.initialProps).length > 0) {
      this.props = this.initialProps;
      return this.props;
    }
    const pipeline = this.pipeline;
    const mod = await this.loadComponentInstance();
    this.props = await getProps({
      mod,
      routeData: this.routeData,
      routeCache: pipeline.routeCache,
      pathname: this.pathname,
      logger: pipeline.logger,
      serverLike: pipeline.manifest.serverLike,
      base: pipeline.manifest.base,
      trailingSlash: pipeline.manifest.trailingSlash
    });
    return this.props;
  }
  /**
   * Returns the `ActionAPIContext` for this render, creating it lazily.
   * Used by middleware, actions, and page dispatch.
   */
  getActionAPIContext() {
    if (this.actionApiContext !== null) return this.actionApiContext;
    const state = this;
    const ctx = {
      get cookies() {
        return state.cookies;
      },
      routePattern: this.routeData.route,
      isPrerendered: this.routeData.prerender,
      get clientAddress() {
        return state.getClientAddress();
      },
      get currentLocale() {
        return state.computeCurrentLocale();
      },
      generator: ASTRO_GENERATOR,
      get locals() {
        return state.locals;
      },
      set locals(_) {
        throw new AstroError(LocalsReassigned);
      },
      // SAFETY: getActionAPIContext is only called after route resolution,
      // so routeData is always set and the params getter always returns a value.
      params: this.params,
      get preferredLocale() {
        return state.computePreferredLocale();
      },
      get preferredLocaleList() {
        return state.computePreferredLocaleList();
      },
      request: this.request,
      site: this.pipeline.site,
      url: this.url,
      get originPathname() {
        return getOriginPathname(state.request);
      },
      get csp() {
        return state.getCsp();
      },
      get logger() {
        if (!state.pipeline.manifest.experimentalLogger) {
          state.pipeline.logger.warn(
            null,
            "The Astro.logger is available only when experimental.logger is defined."
          );
          return void 0;
        }
        return {
          info(msg) {
            state.pipeline.logger.info(null, msg);
          },
          warn(msg) {
            state.pipeline.logger.warn(null, msg);
          },
          error(msg) {
            state.pipeline.logger.error(null, msg);
          }
        };
      }
    };
    this.defineProviderGetters(ctx);
    this.actionApiContext = ctx;
    return this.actionApiContext;
  }
  /**
   * Returns the `APIContext` for this render, creating it lazily from
   * the memoized props + action context.
   *
   * Callers must ensure `getProps()` has resolved at least once before
   * calling this.
   */
  getAPIContext() {
    if (this.apiContext !== null) return this.apiContext;
    const actionApiContext = this.getActionAPIContext();
    const state = this;
    const redirect = (path, status = 302) => new Response(null, { status, headers: { Location: path } });
    const rewrite = async (reroutePayload) => {
      return await state.rewrite(reroutePayload);
    };
    Reflect.set(actionApiContext, pipelineSymbol, this.pipeline);
    actionApiContext[fetchStateSymbol] = this;
    this.apiContext = Object.assign(actionApiContext, {
      props: this.props,
      redirect,
      rewrite,
      getActionResult: createGetActionResult(actionApiContext.locals),
      callAction: createCallAction(actionApiContext)
    });
    return this.apiContext;
  }
  /**
   * Invalidates the cached `APIContext` so the next `getAPIContext()`
   * call re-derives it from the (possibly mutated) state. Used
   * after an in-flight rewrite swaps the route / request / params.
   */
  invalidateContexts() {
    this.props = null;
    this.actionApiContext = null;
    this.apiContext = null;
  }
}

class ActionHandler {
  /**
   * Run action handling for the current request. Expects the APIContext
   * that is already being used by the render pipeline.
   *
   * Returns a `Response` when the action fully handles the request (RPC),
   * or `undefined` when the caller should continue processing the
   * request (form actions or non-action requests).
   */
  handle(apiContext, state) {
    state.pipeline.usedFeatures |= PipelineFeatures.actions;
    if (apiContext.isPrerendered) {
      return void 0;
    }
    const { action, setActionResult } = getActionContext(apiContext);
    if (!action) {
      return void 0;
    }
    return this.#executeAction(action, setActionResult);
  }
  async #executeAction(action, setActionResult) {
    const actionResult = await action.handler();
    const serialized = serializeActionResult(actionResult);
    if (action.calledFrom === "rpc") {
      if (serialized.type === "empty") {
        return new Response(null, {
          status: serialized.status
        });
      }
      return new Response(serialized.body, {
        status: serialized.status,
        headers: {
          "Content-Type": serialized.contentType
        }
      });
    }
    setActionResult(action.name, serialized);
    return void 0;
  }
}

function prepareResponse(response, { addCookieHeader }) {
  for (const headerName of INTERNAL_RESPONSE_HEADERS) {
    if (response.headers.has(headerName)) {
      response.headers.delete(headerName);
    }
  }
  if (addCookieHeader) {
    for (const setCookieHeaderValue of getSetCookiesFromResponse(response)) {
      response.headers.append("set-cookie", setCookieHeaderValue);
    }
  }
  Reflect.set(response, responseSentSymbol$1, true);
}

function redirectTemplate({
  status,
  absoluteLocation,
  relativeLocation,
  from
}) {
  const delay = status === 302 ? 2 : 0;
  const rel = escape(String(relativeLocation));
  const abs = escape(String(absoluteLocation));
  const fromHtml = from ? `from <code>${escape(from)}</code> ` : "";
  return `<!doctype html>
<title>Redirecting to: ${rel}</title>
<meta http-equiv="refresh" content="${delay};url=${rel}">
<meta name="robots" content="noindex">
<link rel="canonical" href="${abs}">
<body>
	<a href="${rel}">Redirecting ${fromHtml}to <code>${rel}</code></a>
</body>`;
}

class TrailingSlashHandler {
  #app;
  constructor(app) {
    this.#app = app;
  }
  /**
   * Returns a redirect `Response` if the request pathname needs
   * normalization, or `undefined` if no redirect is required.
   */
  handle(state) {
    const url = new URL(state.request.url);
    const redirect = this.#redirectTrailingSlash(url.pathname);
    if (redirect === url.pathname) {
      return void 0;
    }
    const addCookieHeader = state.renderOptions.addCookieHeader;
    const status = state.request.method === "GET" ? 301 : 308;
    const response = new Response(
      redirectTemplate({
        status,
        relativeLocation: url.pathname,
        absoluteLocation: redirect,
        from: state.request.url
      }),
      {
        status,
        headers: {
          location: redirect + url.search
        }
      }
    );
    prepareResponse(response, { addCookieHeader });
    return response;
  }
  #redirectTrailingSlash(pathname) {
    const { trailingSlash } = this.#app.manifest;
    if (pathname === "/" || isInternalPath(pathname)) {
      return pathname;
    }
    const path = collapseDuplicateTrailingSlashes(pathname, trailingSlash !== "never");
    if (path !== pathname) {
      return path;
    }
    if (trailingSlash === "ignore") {
      return pathname;
    }
    if (trailingSlash === "always" && !hasFileExtension(pathname)) {
      return appendForwardSlash(pathname);
    }
    if (trailingSlash === "never") {
      return removeTrailingForwardSlash(pathname);
    }
    return pathname;
  }
}

function defaultSetHeaders(options) {
  const headers = new Headers();
  const directives = [];
  if (options.maxAge !== void 0) {
    directives.push(`max-age=${options.maxAge}`);
  }
  if (options.swr !== void 0) {
    directives.push(`stale-while-revalidate=${options.swr}`);
  }
  if (directives.length > 0) {
    headers.set("CDN-Cache-Control", directives.join(", "));
  }
  if (options.tags && options.tags.length > 0) {
    headers.set("Cache-Tag", options.tags.join(", "));
  }
  if (options.lastModified) {
    headers.set("Last-Modified", options.lastModified.toUTCString());
  }
  if (options.etag) {
    headers.set("ETag", options.etag);
  }
  return headers;
}
function isLiveDataEntry(value) {
  return value != null && typeof value === "object" && "id" in value && "data" in value && "cacheHint" in value;
}

const APPLY_HEADERS = /* @__PURE__ */ Symbol.for("astro:cache:apply");
const IS_ACTIVE = /* @__PURE__ */ Symbol.for("astro:cache:active");
class AstroCache {
  #options = {};
  #tags = /* @__PURE__ */ new Set();
  #disabled = false;
  #provider;
  enabled = true;
  constructor(provider) {
    this.#provider = provider;
  }
  set(input) {
    if (input === false) {
      this.#disabled = true;
      this.#tags.clear();
      this.#options = {};
      return;
    }
    this.#disabled = false;
    let options;
    if (isLiveDataEntry(input)) {
      if (!input.cacheHint) return;
      options = input.cacheHint;
    } else {
      options = input;
    }
    if ("maxAge" in options && options.maxAge !== void 0) this.#options.maxAge = options.maxAge;
    if ("swr" in options && options.swr !== void 0)
      this.#options.swr = options.swr;
    if ("etag" in options && options.etag !== void 0)
      this.#options.etag = options.etag;
    if (options.lastModified !== void 0) {
      if (!this.#options.lastModified || options.lastModified > this.#options.lastModified) {
        this.#options.lastModified = options.lastModified;
      }
    }
    if (options.tags) {
      for (const tag of options.tags) this.#tags.add(tag);
    }
  }
  get tags() {
    return [...this.#tags];
  }
  /**
   * Get the current cache options (read-only snapshot).
   * Includes all accumulated options: maxAge, swr, tags, etag, lastModified.
   */
  get options() {
    return {
      ...this.#options,
      tags: this.tags
    };
  }
  async invalidate(input) {
    if (!this.#provider) {
      throw new AstroError(CacheNotEnabled);
    }
    let options;
    if (isLiveDataEntry(input)) {
      options = { tags: input.cacheHint?.tags ?? [] };
    } else {
      options = input;
    }
    return this.#provider.invalidate(options);
  }
  /** @internal */
  [APPLY_HEADERS](response) {
    if (this.#disabled) return;
    const finalOptions = { ...this.#options, tags: this.tags };
    if (finalOptions.maxAge === void 0 && !finalOptions.tags?.length) return;
    const headers = this.#provider?.setHeaders?.(finalOptions) ?? defaultSetHeaders(finalOptions);
    for (const [key, value] of headers) {
      response.headers.set(key, value);
    }
  }
  /** @internal */
  get [IS_ACTIVE]() {
    return !this.#disabled && (this.#options.maxAge !== void 0 || this.#tags.size > 0);
  }
}
function applyCacheHeaders(cache, response) {
  if (APPLY_HEADERS in cache) {
    cache[APPLY_HEADERS](response);
  }
}

const ROUTE_DYNAMIC_SPLIT = /\[(.+?\(.+?\)|.+?)\]/;
const ROUTE_SPREAD = /^\.{3}.+$/;
function getParts(part, file) {
  const result = [];
  part.split(ROUTE_DYNAMIC_SPLIT).map((str, i) => {
    if (!str) return;
    const dynamic = i % 2 === 1;
    const [, content] = dynamic ? /([^(]+)$/.exec(str) || [null, null] : [null, str];
    if (!content || dynamic && !/^(?:\.\.\.)?[\w$]+$/.test(content)) {
      throw new Error(`Invalid route ${file} \u2014 parameter name must match /^[a-zA-Z0-9_$]+$/`);
    }
    result.push({
      content,
      dynamic,
      spread: dynamic && ROUTE_SPREAD.test(content)
    });
  });
  return result;
}

function compileCacheRoutes(routes, base, trailingSlash) {
  const compiled = Object.entries(routes).map(([path, options]) => {
    const segments = removeLeadingForwardSlash(path).split("/").filter(Boolean).map((s) => getParts(s, path));
    const pattern = getPattern(segments, base, trailingSlash);
    return { pattern, options, segments, route: path };
  });
  compiled.sort(
    (a, b) => routeComparator(
      { segments: a.segments, route: a.route, type: "page" },
      { segments: b.segments, route: b.route, type: "page" }
    )
  );
  return compiled;
}
function matchCacheRoute(pathname, compiledRoutes) {
  for (const route of compiledRoutes) {
    if (route.pattern.test(pathname)) return route.options;
  }
  return null;
}

const CACHE_KEY = "cache";
function provideCache(state) {
  const pipeline = state.pipeline;
  if (!pipeline.cacheConfig) {
    state.provide(CACHE_KEY, {
      create: () => new DisabledAstroCache(pipeline.logger)
    });
    return;
  }
  if (pipeline.runtimeMode === "development") {
    state.provide(CACHE_KEY, {
      create: () => new NoopAstroCache()
    });
    return;
  }
  return provideCacheAsync(state, pipeline);
}
async function provideCacheAsync(state, pipeline) {
  const cacheProvider = await pipeline.getCacheProvider();
  state.provide(CACHE_KEY, {
    create() {
      const cache = new AstroCache(cacheProvider);
      if (pipeline.cacheConfig?.routes) {
        if (!pipeline.compiledCacheRoutes) {
          pipeline.compiledCacheRoutes = compileCacheRoutes(
            pipeline.cacheConfig.routes,
            pipeline.manifest.base,
            pipeline.manifest.trailingSlash
          );
        }
        const matched = matchCacheRoute(state.pathname, pipeline.compiledCacheRoutes);
        if (matched) {
          cache.set(matched);
        }
      }
      return cache;
    }
  });
}
class CacheHandler {
  #app;
  constructor(app) {
    this.#app = app;
  }
  async handle(state, next) {
    this.#app.pipeline.usedFeatures |= PipelineFeatures.cache;
    if (!this.#app.pipeline.cacheProvider) {
      return next();
    }
    const cache = state.resolve(CACHE_KEY);
    const cacheProvider = await this.#app.pipeline.getCacheProvider();
    if (cacheProvider?.onRequest) {
      const response2 = await cacheProvider.onRequest(
        {
          request: state.request,
          url: new URL(state.request.url),
          waitUntil: state.renderOptions.waitUntil
        },
        async () => {
          const res = await next();
          applyCacheHeaders(cache, res);
          return res;
        }
      );
      response2.headers.delete("CDN-Cache-Control");
      response2.headers.delete("Cache-Tag");
      return response2;
    }
    const response = await next();
    applyCacheHeaders(cache, response);
    return response;
  }
}

function isExternalURL(url) {
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//");
}
function redirectIsExternal(redirect) {
  if (typeof redirect === "string") {
    return isExternalURL(redirect);
  } else {
    return isExternalURL(redirect.destination);
  }
}
function computeRedirectStatus(method, redirect, redirectRoute) {
  return redirectRoute && typeof redirect === "object" ? redirect.status : method === "GET" ? 301 : 308;
}
function resolveRedirectTarget(params, redirect, redirectRoute, trailingSlash) {
  if (typeof redirectRoute !== "undefined") {
    const generate = getRouteGenerator(redirectRoute.segments, trailingSlash);
    return generate(params);
  } else if (typeof redirect === "string") {
    if (redirectIsExternal(redirect)) {
      return redirect;
    } else {
      let target = redirect;
      for (const param of Object.keys(params)) {
        const paramValue = params[param];
        target = target.replace(`[${param}]`, paramValue).replace(`[...${param}]`, paramValue);
      }
      return target;
    }
  } else if (typeof redirect === "undefined") {
    return "/";
  }
  return redirect.destination;
}
async function renderRedirect(state) {
  state.pipeline.usedFeatures |= PipelineFeatures.redirects;
  const routeData = state.routeData;
  const { redirect, redirectRoute } = routeData;
  const status = computeRedirectStatus(state.request.method, redirect, redirectRoute);
  const headers = {
    location: encodeURI(
      resolveRedirectTarget(
        state.params,
        redirect,
        redirectRoute,
        state.pipeline.manifest.trailingSlash
      )
    )
  };
  if (redirect && redirectIsExternal(redirect)) {
    if (typeof redirect === "string") {
      return Response.redirect(redirect, status);
    } else {
      return Response.redirect(redirect.destination, status);
    }
  }
  return new Response(null, { status, headers });
}

const PERSIST_SYMBOL = /* @__PURE__ */ Symbol();
const DEFAULT_COOKIE_NAME = "astro-session";
const VALID_COOKIE_REGEX = /^[\w-]+$/;
const unflatten = (parsed, _) => {
  return unflatten$1(parsed, {
    URL: (href) => new URL(href)
  });
};
const stringify = (data, _) => {
  return stringify$1(data, {
    // Support URL objects
    URL: (val) => val instanceof URL && val.href
  });
};
class AstroSession {
  // The cookies object.
  #cookies;
  // The session configuration.
  #config;
  // The cookie config
  #cookieConfig;
  // The cookie name
  #cookieName;
  // The unstorage object for the session driver.
  #storage;
  #data;
  // The session ID. A v4 UUID.
  #sessionID;
  // Sessions to destroy. Needed because we won't have the old session ID after it's destroyed locally.
  #toDestroy = /* @__PURE__ */ new Set();
  // Session keys to delete. Used for partial data sets to avoid overwriting the deleted value.
  #toDelete = /* @__PURE__ */ new Set();
  // Whether the session is dirty and needs to be saved.
  #dirty = false;
  // Whether the session cookie has been set.
  #cookieSet = false;
  // Whether the session ID was sourced from a client cookie rather than freshly generated.
  #sessionIDFromCookie = false;
  // The local data is "partial" if it has not been loaded from storage yet and only
  // contains values that have been set or deleted in-memory locally.
  // We do this to avoid the need to block on loading data when it is only being set.
  // When we load the data from storage, we need to merge it with the local partial data,
  // preserving in-memory changes and deletions.
  #partial = true;
  // The driver factory function provided by the pipeline
  #driverFactory;
  static #sharedStorage = /* @__PURE__ */ new Map();
  constructor({
    cookies,
    config,
    runtimeMode,
    driverFactory,
    mockStorage
  }) {
    if (!config) {
      throw new AstroError({
        ...SessionStorageInitError,
        message: SessionStorageInitError.message(
          "No driver was defined in the session configuration and the adapter did not provide a default driver."
        )
      });
    }
    this.#cookies = cookies;
    this.#driverFactory = driverFactory;
    const { cookie: cookieConfig = DEFAULT_COOKIE_NAME, ...configRest } = config;
    let cookieConfigObject;
    if (typeof cookieConfig === "object") {
      const { name = DEFAULT_COOKIE_NAME, ...rest } = cookieConfig;
      this.#cookieName = name;
      cookieConfigObject = rest;
    } else {
      this.#cookieName = cookieConfig || DEFAULT_COOKIE_NAME;
    }
    this.#cookieConfig = {
      sameSite: "lax",
      secure: runtimeMode === "production",
      path: "/",
      ...cookieConfigObject,
      httpOnly: true
    };
    this.#config = configRest;
    if (mockStorage) {
      this.#storage = mockStorage;
    }
  }
  /**
   * Gets a session value. Returns `undefined` if the session or value does not exist.
   */
  async get(key) {
    return (await this.#ensureData()).get(key)?.data;
  }
  /**
   * Checks if a session value exists.
   */
  async has(key) {
    return (await this.#ensureData()).has(key);
  }
  /**
   * Gets all session values.
   */
  async keys() {
    return (await this.#ensureData()).keys();
  }
  /**
   * Gets all session values.
   */
  async values() {
    return [...(await this.#ensureData()).values()].map((entry) => entry.data);
  }
  /**
   * Gets all session entries.
   */
  async entries() {
    return [...(await this.#ensureData()).entries()].map(([key, entry]) => [key, entry.data]);
  }
  /**
   * Deletes a session value.
   */
  delete(key) {
    this.#data ??= /* @__PURE__ */ new Map();
    this.#data.delete(key);
    if (this.#partial) {
      this.#toDelete.add(key);
    }
    this.#dirty = true;
  }
  /**
   * Sets a session value. The session is created if it does not exist.
   */
  set(key, value, { ttl } = {}) {
    if (!key) {
      throw new AstroError({
        ...SessionStorageSaveError,
        message: "The session key was not provided."
      });
    }
    let cloned;
    try {
      cloned = unflatten(JSON.parse(stringify(value)));
    } catch (err) {
      throw new AstroError(
        {
          ...SessionStorageSaveError,
          message: `The session data for ${key} could not be serialized.`,
          hint: "See the devalue library for all supported types: https://github.com/rich-harris/devalue"
        },
        { cause: err }
      );
    }
    if (!this.#cookieSet) {
      this.#setCookie();
      this.#cookieSet = true;
    }
    this.#data ??= /* @__PURE__ */ new Map();
    const lifetime = ttl ?? this.#config.ttl;
    const expires = typeof lifetime === "number" ? Date.now() + lifetime * 1e3 : lifetime;
    this.#data.set(key, {
      data: cloned,
      expires
    });
    this.#dirty = true;
  }
  /**
   * Destroys the session, clearing the cookie and storage if it exists.
   */
  destroy() {
    const sessionId = this.#sessionID ?? this.#cookies.get(this.#cookieName)?.value;
    if (sessionId) {
      this.#toDestroy.add(sessionId);
    }
    this.#cookies.delete(this.#cookieName, this.#cookieConfig);
    this.#sessionID = void 0;
    this.#data = void 0;
    this.#dirty = true;
  }
  /**
   * Regenerates the session, creating a new session ID. The existing session data is preserved.
   */
  async regenerate() {
    let data = /* @__PURE__ */ new Map();
    try {
      data = await this.#ensureData();
    } catch (err) {
      console.error("Failed to load session data during regeneration:", err);
    }
    const oldSessionId = this.#sessionID;
    this.#sessionID = crypto.randomUUID();
    this.#sessionIDFromCookie = false;
    this.#data = data;
    this.#dirty = true;
    await this.#setCookie();
    if (oldSessionId && this.#storage) {
      this.#storage.removeItem(oldSessionId).catch((err) => {
        console.error("Failed to remove old session data:", err);
      });
    }
  }
  // Persists the session data to storage.
  // This is called automatically at the end of the request.
  // Uses a symbol to prevent users from calling it directly.
  async [PERSIST_SYMBOL]() {
    if (!this.#dirty && !this.#toDestroy.size) {
      return;
    }
    const storage = await this.#ensureStorage();
    if (this.#dirty && this.#data) {
      const data = await this.#ensureData();
      this.#toDelete.forEach((key2) => data.delete(key2));
      const key = this.#ensureSessionID();
      let serialized;
      try {
        serialized = stringify(data);
      } catch (err) {
        throw new AstroError(
          {
            ...SessionStorageSaveError,
            message: SessionStorageSaveError.message(
              "The session data could not be serialized.",
              this.#config.driver
            )
          },
          { cause: err }
        );
      }
      await storage.setItem(key, serialized);
      this.#dirty = false;
    }
    if (this.#toDestroy.size > 0) {
      const cleanupPromises = [...this.#toDestroy].map(
        (sessionId) => storage.removeItem(sessionId).catch((err) => {
          console.error("Failed to clean up session %s:", sessionId, err);
        })
      );
      await Promise.all(cleanupPromises);
      this.#toDestroy.clear();
    }
  }
  get sessionID() {
    return this.#sessionID;
  }
  /**
   * Loads a session from storage with the given ID, and replaces the current session.
   * Any changes made to the current session will be lost.
   * This is not normally needed, as the session is automatically loaded using the cookie.
   * However it can be used to restore a session where the ID has been recorded somewhere
   * else (e.g. in a database).
   */
  async load(sessionID) {
    this.#sessionID = sessionID;
    this.#data = void 0;
    await this.#setCookie();
    await this.#ensureData();
  }
  /**
   * Sets the session cookie.
   */
  async #setCookie() {
    if (!VALID_COOKIE_REGEX.test(this.#cookieName)) {
      throw new AstroError({
        ...SessionStorageSaveError,
        message: "Invalid cookie name. Cookie names can only contain letters, numbers, and dashes."
      });
    }
    const value = this.#ensureSessionID();
    this.#cookies.set(this.#cookieName, value, this.#cookieConfig);
  }
  /**
   * Attempts to load the session data from storage, or creates a new data object if none exists.
   * If there is existing partial data, it will be merged into the new data object.
   */
  async #ensureData() {
    if (this.#data && !this.#partial) {
      return this.#data;
    }
    this.#data ??= /* @__PURE__ */ new Map();
    if (!this.#sessionID && !this.#cookies.get(this.#cookieName)?.value) {
      this.#partial = false;
      return this.#data;
    }
    const storage = await this.#ensureStorage();
    const raw = await storage.get(this.#ensureSessionID());
    if (!raw) {
      if (this.#sessionIDFromCookie) {
        this.#sessionID = crypto.randomUUID();
        this.#sessionIDFromCookie = false;
        if (this.#cookieSet) {
          await this.#setCookie();
        }
      }
      return this.#data;
    }
    try {
      const storedMap = unflatten(raw);
      if (!(storedMap instanceof Map)) {
        await this.destroy();
        throw new AstroError({
          ...SessionStorageInitError,
          message: SessionStorageInitError.message(
            "The session data was an invalid type.",
            this.#config.driver
          )
        });
      }
      const now = Date.now();
      for (const [key, value] of storedMap) {
        const expired = typeof value.expires === "number" && value.expires < now;
        if (!this.#data.has(key) && !this.#toDelete.has(key) && !expired) {
          this.#data.set(key, value);
        }
      }
      this.#partial = false;
      return this.#data;
    } catch (err) {
      await this.destroy();
      if (err instanceof AstroError) {
        throw err;
      }
      throw new AstroError(
        {
          ...SessionStorageInitError,
          message: SessionStorageInitError.message(
            "The session data could not be parsed.",
            this.#config.driver
          )
        },
        { cause: err }
      );
    }
  }
  /**
   * Returns the session ID, generating a new one if it does not exist.
   */
  #ensureSessionID() {
    if (!this.#sessionID) {
      const cookieValue = this.#cookies.get(this.#cookieName)?.value;
      if (cookieValue) {
        this.#sessionID = cookieValue;
        this.#sessionIDFromCookie = true;
      } else {
        this.#sessionID = crypto.randomUUID();
      }
    }
    return this.#sessionID;
  }
  /**
   * Ensures the storage is initialized.
   * This is called automatically when a storage operation is needed.
   */
  async #ensureStorage() {
    if (this.#storage) {
      return this.#storage;
    }
    if (AstroSession.#sharedStorage.has(this.#config.driver)) {
      this.#storage = AstroSession.#sharedStorage.get(this.#config.driver);
      return this.#storage;
    }
    if (!this.#driverFactory) {
      throw new AstroError({
        ...SessionStorageInitError,
        message: SessionStorageInitError.message(
          "Astro could not load the driver correctly. Does it exist?",
          this.#config.driver
        )
      });
    }
    const driver = this.#driverFactory;
    try {
      this.#storage = createStorage({
        driver: {
          ...driver(this.#config.options),
          // Unused methods
          hasItem() {
            return false;
          },
          getKeys() {
            return [];
          }
        }
      });
      AstroSession.#sharedStorage.set(this.#config.driver, this.#storage);
      return this.#storage;
    } catch (err) {
      throw new AstroError(
        {
          ...SessionStorageInitError,
          message: SessionStorageInitError.message("Unknown error", this.#config.driver)
        },
        { cause: err }
      );
    }
  }
}

const SESSION_KEY = "session";
function provideSession(state) {
  state.pipeline.usedFeatures |= PipelineFeatures.sessions;
  const pipeline = state.pipeline;
  const config = pipeline.manifest.sessionConfig;
  if (!config) return;
  return provideSessionAsync(state, config);
}
async function provideSessionAsync(state, config) {
  const pipeline = state.pipeline;
  const driverFactory = await pipeline.getSessionDriver();
  if (!driverFactory) return;
  state.provide(SESSION_KEY, {
    create() {
      const cookies = state.cookies;
      return new AstroSession({
        cookies,
        config,
        runtimeMode: pipeline.runtimeMode,
        driverFactory,
        mockStorage: null
      });
    },
    finalize(session) {
      return session[PERSIST_SYMBOL]();
    }
  });
}

class AstroHandler {
  #app;
  #trailingSlashHandler;
  #actionHandler;
  #astroMiddleware;
  #pagesHandler;
  #cacheHandler;
  /** Bound callback for the middleware chain — created once, reused per request. */
  #renderRouteCallback;
  /**
   * i18n post-processor. Only set when the app has i18n configured and
   * the strategy is not `manual` — for the manual strategy users wire
   * `astro:i18n.middleware(...)` into their own `onRequest`.
   */
  #i18n;
  /** Whether sessions are configured on the manifest. */
  #hasSession;
  constructor(app) {
    this.#app = app;
    this.#trailingSlashHandler = new TrailingSlashHandler(app);
    this.#actionHandler = new ActionHandler();
    this.#astroMiddleware = new AstroMiddleware(app.pipeline);
    this.#pagesHandler = new PagesHandler(app.pipeline);
    this.#cacheHandler = new CacheHandler(app);
    this.#renderRouteCallback = this.#actionsAndPages.bind(this);
    this.#hasSession = !!app.manifest.sessionConfig;
    const i18n = app.manifest.i18n;
    if (i18n && i18n.strategy !== "manual") {
      this.#i18n = new I18n(
        i18n,
        app.manifest.base,
        app.manifest.trailingSlash,
        app.manifest.buildFormat
      );
    }
  }
  /**
   * Runs actions then pages — the callback at the bottom of the
   * middleware chain. Bound once in the constructor to avoid
   * per-request closure allocation.
   */
  #actionsAndPages(state, ctx) {
    if (!state.skipMiddleware) {
      const actionResult = this.#actionHandler.handle(ctx, state);
      if (actionResult) {
        return actionResult.then((response) => response ?? this.#pagesHandler.handle(state, ctx));
      }
    }
    return this.#pagesHandler.handle(state, ctx);
  }
  async handle(state) {
    state.pipeline.usedFeatures |= ALL_PIPELINE_FEATURES;
    if (state.invalidEncoding) {
      return new Response(null, { status: 400, statusText: "Bad Request" });
    }
    const trailingSlashRedirect = this.#trailingSlashHandler.handle(state);
    if (trailingSlashRedirect) {
      return trailingSlashRedirect;
    }
    if (!state.routeData) {
      return this.#app.renderError(state.request, {
        ...state.renderOptions,
        status: 404,
        pathname: state.pathname
      });
    }
    return this.render(state);
  }
  /**
   * Renders a response for the given `FetchState`. Assumes
   * trailing-slash redirects and routeData resolution have already run.
   *
   * User-triggered rewrites (`Astro.rewrite` / `ctx.rewrite`) go through
   * `Rewrites.execute` on the current `FetchState` — they mutate the
   * existing state in place and re-run middleware + page dispatch.
   */
  async render(state) {
    const routeData = state.routeData;
    const pathname = state.pathname;
    const request = state.request;
    const { addCookieHeader } = state.renderOptions;
    const defaultStatus = this.#app.getDefaultStatusCode(routeData, pathname);
    state.status = defaultStatus;
    let response;
    try {
      const sessionP = this.#hasSession ? provideSession(state) : void 0;
      const cacheP = provideCache(state);
      if (sessionP || cacheP) await Promise.all([sessionP, cacheP]);
      state.pipeline.usedFeatures |= PipelineFeatures.sessions;
      if (routeData.type === "redirect") {
        const redirectResponse = await renderRedirect(state);
        this.#app.logThisRequest({
          pathname,
          method: request.method,
          statusCode: redirectResponse.status,
          isRewrite: false,
          timeStart: state.timeStart
        });
        prepareResponse(redirectResponse, { addCookieHeader });
        this.#app.pipeline.logger.flush();
        return redirectResponse;
      }
      if (!this.#app.pipeline.cacheProvider) {
        this.#app.pipeline.usedFeatures |= PipelineFeatures.cache;
        response = await this.#astroMiddleware.handle(state, this.#renderRouteCallback);
        if (this.#i18n) {
          response = await this.#i18n.finalize(state, response);
        }
      } else {
        const runPipeline = async () => {
          let res = await this.#astroMiddleware.handle(state, this.#renderRouteCallback);
          if (this.#i18n) {
            res = await this.#i18n.finalize(state, res);
          }
          return res;
        };
        response = await this.#cacheHandler.handle(state, runPipeline);
      }
      const isRewrite = response.headers.has(REWRITE_DIRECTIVE_HEADER_KEY);
      this.#app.logThisRequest({
        pathname,
        method: request.method,
        statusCode: response.status,
        isRewrite,
        timeStart: state.timeStart
      });
    } catch (err) {
      this.#app.logger.error(null, err.stack || err.message || String(err));
      return this.#app.renderError(request, {
        ...state.renderOptions,
        status: 500,
        error: err,
        pathname: state.pathname
      });
    } finally {
      const finalize = state.finalizeAll();
      if (finalize) await finalize;
    }
    if (REROUTABLE_STATUS_CODES.includes(response.status) && // If the body isn't null, that means the user sets the 404 status
    // but uses the current route to handle the 404
    response.body === null && response.headers.get(REROUTE_DIRECTIVE_HEADER) !== "no") {
      return this.#app.renderError(request, {
        ...state.renderOptions,
        response,
        status: response.status,
        // We don't have an error to report here. Passing null means we pass nothing intentionally
        // while undefined means there's no error
        error: response.status === 500 ? null : void 0,
        pathname: state.pathname
      });
    }
    prepareResponse(response, { addCookieHeader });
    this.#app.pipeline.logger.flush();
    return response;
  }
}

class DefaultFetchHandler {
  #app;
  #handler;
  constructor(app) {
    this.#app = app ?? null;
    this.#handler = app ? new AstroHandler(app) : null;
  }
  /**
   * Fast path: called directly by `BaseApp.render()` with pre-resolved
   * options, avoiding the `Reflect.set/get` round-trip through the request.
   */
  renderWithOptions(request, options) {
    if (!this.#app) {
      const app = Reflect.get(request, appSymbol);
      if (!app) {
        throw new Error("No fetch handler provided.");
      }
      this.#app = app;
      this.#handler = new AstroHandler(app);
    }
    const state = new FetchState(this.#app.pipeline, request, options);
    return this.#handler.handle(state);
  }
  fetch = (request) => {
    if (!this.#app) {
      const app = Reflect.get(request, appSymbol);
      if (!app) {
        throw new Error("No fetch handler provided.");
      }
      this.#app = app;
      this.#handler = new AstroHandler(app);
    }
    const state = new FetchState(this.#app.pipeline, request);
    if (!this.#handler) {
      throw new Error("No fetch handler provided.");
    }
    return this.#handler.handle(state);
  };
}

const fetchable = new DefaultFetchHandler();

class DefaultErrorHandler {
  #app;
  #astroMiddleware;
  #pagesHandler;
  constructor(app) {
    this.#app = app;
    this.#astroMiddleware = new AstroMiddleware(app.pipeline);
    this.#pagesHandler = new PagesHandler(app.pipeline);
  }
  async renderError(request, {
    status,
    response: originalResponse,
    skipMiddleware = false,
    error,
    pathname,
    ...resolvedRenderOptions
  }) {
    const app = this.#app;
    const resolvedPathname = pathname ?? new FetchState(app.pipeline, request).pathname;
    const errorRoutePath = `/${status}${app.manifest.trailingSlash === "always" ? "/" : ""}`;
    const errorRouteData = matchRoute(errorRoutePath, app.manifestData);
    const url = new URL(request.url);
    if (errorRouteData) {
      if (errorRouteData.prerender) {
        const maybeDotHtml = errorRouteData.route.endsWith(`/${status}`) ? ".html" : "";
        const allowedDomains = app.manifest.allowedDomains;
        const validatedHost = validateHost(url.host, url.protocol.replace(":", ""), allowedDomains);
        const safeOrigin = validatedHost ? url.origin : `${url.protocol}//localhost`;
        const statusURL = new URL(
          `${app.baseWithoutTrailingSlash}/${status}${maybeDotHtml}`,
          safeOrigin
        );
        if (statusURL.toString() !== request.url && resolvedRenderOptions.prerenderedErrorPageFetch) {
          try {
            const response2 = await resolvedRenderOptions.prerenderedErrorPageFetch(
              statusURL.toString()
            );
            const override = { status, removeContentEncodingHeaders: true };
            const newResponse = mergeResponses(response2, originalResponse, override);
            prepareResponse(newResponse, resolvedRenderOptions);
            return newResponse;
          } catch {
            const response2 = mergeResponses(new Response(null, { status }), originalResponse);
            prepareResponse(response2, resolvedRenderOptions);
            return response2;
          }
        }
      }
      const mod = await app.pipeline.getComponentByRoute(errorRouteData);
      const errorState = new FetchState(app.pipeline, request);
      errorState.skipMiddleware = skipMiddleware;
      errorState.clientAddress = resolvedRenderOptions.clientAddress;
      errorState.routeData = errorRouteData;
      errorState.pathname = resolvedPathname;
      errorState.status = status;
      errorState.componentInstance = mod;
      errorState.locals = resolvedRenderOptions.locals ?? {};
      errorState.initialProps = { error };
      try {
        await provideSession(errorState);
        const response2 = await this.#astroMiddleware.handle(
          errorState,
          this.#pagesHandler.handle.bind(this.#pagesHandler)
        );
        const newResponse = mergeResponses(response2, originalResponse);
        prepareResponse(newResponse, resolvedRenderOptions);
        return newResponse;
      } catch {
        if (skipMiddleware === false) {
          return this.renderError(request, {
            ...resolvedRenderOptions,
            status,
            response: originalResponse,
            skipMiddleware: true,
            pathname: resolvedPathname
          });
        }
      } finally {
        await errorState.finalizeAll();
      }
    }
    const response = mergeResponses(new Response(null, { status }), originalResponse);
    prepareResponse(response, resolvedRenderOptions);
    return response;
  }
}
function mergeResponses(newResponse, originalResponse, override) {
  let newResponseHeaders = newResponse.headers;
  if (override?.removeContentEncodingHeaders) {
    newResponseHeaders = new Headers(newResponseHeaders);
    newResponseHeaders.delete("Content-Encoding");
    newResponseHeaders.delete("Content-Length");
  }
  if (!originalResponse) {
    if (override !== void 0) {
      return new Response(newResponse.body, {
        status: override.status,
        statusText: newResponse.statusText,
        headers: newResponseHeaders
      });
    }
    return newResponse;
  }
  const status = override?.status ? override.status : originalResponse.status === 200 ? newResponse.status : originalResponse.status;
  try {
    originalResponse.headers.delete("Content-type");
    originalResponse.headers.delete("Content-Length");
    originalResponse.headers.delete("Transfer-Encoding");
  } catch {
  }
  const newHeaders = new Headers();
  const seen = /* @__PURE__ */ new Set();
  for (const [name, value] of originalResponse.headers) {
    newHeaders.append(name, value);
    seen.add(name.toLowerCase());
  }
  for (const [name, value] of newResponseHeaders) {
    if (!seen.has(name.toLowerCase())) {
      newHeaders.append(name, value);
    }
  }
  const mergedResponse = new Response(newResponse.body, {
    status,
    statusText: status === 200 ? newResponse.statusText : originalResponse.statusText,
    // If you're looking at here for possible bugs, it means that it's not a bug.
    // With the middleware, users can meddle with headers, and we should pass to the 404/500.
    // If users see something weird, it's because they are setting some headers they should not.
    //
    // Although, we don't want it to replace the content-type, because the error page must return `text/html`
    headers: newHeaders
  });
  const originalCookies = getCookiesFromResponse(originalResponse);
  const newCookies = getCookiesFromResponse(newResponse);
  if (originalCookies) {
    if (newCookies) {
      for (const cookieValue of newCookies.consume()) {
        originalResponse.headers.append("set-cookie", cookieValue);
      }
    }
    attachCookiesToResponse(mergedResponse, originalCookies);
  } else if (newCookies) {
    attachCookiesToResponse(mergedResponse, newCookies);
  }
  return mergedResponse;
}

class BaseApp {
  manifest;
  manifestData;
  pipeline;
  #adapterLogger;
  baseWithoutTrailingSlash;
  /**
   * The handler that turns incoming `Request` objects into `Response`s.
   * Defaults to a `DefaultFetchHandler` pinned to this app and can be
   * overridden via `setFetchHandler` — typically by the bundled
   * entrypoint after importing `virtual:astro:fetchable`.
   */
  #fetchHandler;
  #errorHandler;
  /**
   * Whether a custom fetch handler (from `src/app.ts`) has been set
   * via `setFetchHandler`. When false, the `DefaultFetchHandler` is
   * in use and all features are implicitly active.
   */
  #hasCustomFetchHandler = false;
  /**
   * Whether the missing-feature check has already run. We only want
   * to warn once — after the first request in dev, or at build end.
   */
  #featureCheckDone = false;
  get logger() {
    return this.pipeline.logger;
  }
  get adapterLogger() {
    const currentOptions = this.logger.options;
    if (!this.#adapterLogger || this.#adapterLogger.options !== currentOptions) {
      this.#adapterLogger = new AstroIntegrationLogger(currentOptions, this.manifest.adapterName);
    }
    return this.#adapterLogger;
  }
  constructor(manifest, streaming = true, ...args) {
    this.manifest = manifest;
    this.baseWithoutTrailingSlash = removeTrailingForwardSlash(manifest.base);
    this.pipeline = this.createPipeline(streaming, manifest, ...args);
    this.manifestData = this.pipeline.manifestData;
    this.#fetchHandler = new DefaultFetchHandler(this);
    this.#errorHandler = this.createErrorHandler();
  }
  /**
   * Override the fetch handler used to dispatch requests. Entrypoints
   * call this with the default export of `virtual:astro:fetchable` to
   * plug in a user-authored handler from `src/app.ts`.
   */
  setFetchHandler(handler) {
    this.#fetchHandler = handler;
    this.#hasCustomFetchHandler = !(handler instanceof DefaultFetchHandler);
  }
  /**
   * Returns the error handler strategy used by this app. Override to
   * provide environment-specific behavior (dev overlay, build-time throws, etc.).
   */
  createErrorHandler() {
    return new DefaultErrorHandler(this);
  }
  /**
   * Resets the cached adapter logger so it picks up a new logger instance.
   * Used by BuildApp when the logger is replaced via setOptions().
   */
  resetAdapterLogger() {
    this.#adapterLogger = void 0;
  }
  getAllowedDomains() {
    return this.manifest.allowedDomains;
  }
  matchesAllowedDomains(forwardedHost, protocol) {
    return BaseApp.validateForwardedHost(forwardedHost, this.manifest.allowedDomains, protocol);
  }
  static validateForwardedHost(forwardedHost, allowedDomains, protocol) {
    if (!allowedDomains || allowedDomains.length === 0) {
      return false;
    }
    try {
      const testUrl = new URL(`${protocol || "https"}://${forwardedHost}`);
      return allowedDomains.some((pattern) => {
        return matchPattern(testUrl, pattern);
      });
    } catch {
      return false;
    }
  }
  set setManifestData(newManifestData) {
    this.manifestData = newManifestData;
    this.pipeline.manifestData = newManifestData;
    this.pipeline.rebuildRouter();
  }
  removeBase(pathname) {
    pathname = collapseDuplicateLeadingSlashes(pathname);
    if (pathname.startsWith(this.manifest.base)) {
      return pathname.slice(this.baseWithoutTrailingSlash.length + 1);
    }
    return pathname;
  }
  /**
   * Decodes a pathname with `decodeURI`, falling back to the raw pathname when it
   * contains an invalid percent-sequence (e.g. `%C0%AF`, an overlong-UTF-8 encoding of
   * `/` commonly sent by path-traversal scanners). A raw `decodeURI()` would throw
   * `URIError: URI malformed`, and because `match()` runs before `render()` that error
   * escapes the adapter's request handler as an uncaught exception (HTTP 500) that user
   * middleware can't catch.
   */
  safeDecodeURI(pathname) {
    try {
      return decodeURI(pathname);
    } catch (e) {
      this.adapterLogger.debug(e.toString());
      return pathname;
    }
  }
  /**
   * Extracts the base-stripped, decoded pathname from a request.
   * Used by adapters to compute the pathname for dev-mode route matching.
   */
  getPathnameFromRequest(request) {
    const url = new URL(request.url);
    const pathname = prependForwardSlash(this.removeBase(url.pathname));
    return this.safeDecodeURI(pathname);
  }
  /**
   * Given a `Request`, it returns the `RouteData` that matches its `pathname`. By default, prerendered
   * routes aren't returned, even if they are matched.
   *
   * When `allowPrerenderedRoutes` is `true`, the function returns matched prerendered routes too.
   * @param request
   * @param allowPrerenderedRoutes
   */
  match(request, allowPrerenderedRoutes = false) {
    const url = new URL(request.url);
    if (this.manifest.assets.has(url.pathname)) return void 0;
    let pathname = this.computePathnameFromDomain(request);
    if (!pathname) {
      pathname = prependForwardSlash(this.removeBase(url.pathname));
    }
    const routeData = this.pipeline.matchRoute(this.safeDecodeURI(pathname));
    if (!routeData) return void 0;
    if (allowPrerenderedRoutes) {
      return routeData;
    }
    if (routeData.prerender) {
      if (routeData.params.length > 0) {
        const allMatches = this.pipeline.matchAllRoutes(this.safeDecodeURI(pathname));
        return allMatches.find((r) => !r.prerender);
      }
      return void 0;
    }
    return routeData;
  }
  /**
   * A matching route function to use in the development server.
   * Contrary to the `.match` function, this function resolves props and params, returning the correct
   * route based on the priority, segments. It also returns the correct, resolved pathname.
   * @param pathname
   */
  devMatch(pathname) {
    return void 0;
  }
  computePathnameFromDomain(request) {
    return computePathnameFromDomain(
      request,
      new URL(request.url),
      this.manifest.i18n,
      this.manifest.base,
      this.manifest.trailingSlash,
      this.logger
    );
  }
  async render(request, {
    addCookieHeader = false,
    clientAddress = Reflect.get(request, clientAddressSymbol),
    locals,
    prerenderedErrorPageFetch = fetch,
    routeData,
    waitUntil
  } = {}) {
    await this.pipeline.getLogger();
    if (routeData) {
      this.logger.debug(
        "router",
        "The adapter " + this.manifest.adapterName + " provided a custom RouteData for ",
        request.url
      );
      this.logger.debug("router", "RouteData");
      this.logger.debug("router", routeData);
    }
    if (locals) {
      if (typeof locals !== "object") {
        const error = new AstroError(LocalsNotAnObject);
        this.logger.error(null, error.stack);
        return this.renderError(request, {
          addCookieHeader,
          clientAddress,
          prerenderedErrorPageFetch,
          // If locals are invalid, we don't want to include them when
          // rendering the error page
          locals: void 0,
          routeData,
          waitUntil,
          status: 500,
          error
        });
      }
    }
    if (!routeData) {
      const domainPathname = this.computePathnameFromDomain(request);
      if (domainPathname) {
        routeData = this.pipeline.matchRoute(this.safeDecodeURI(domainPathname));
      }
    }
    const resolvedOptions = {
      addCookieHeader,
      clientAddress,
      prerenderedErrorPageFetch,
      locals,
      routeData,
      waitUntil
    };
    let response;
    if (this.#fetchHandler instanceof DefaultFetchHandler) {
      Reflect.set(request, appSymbol, this);
      response = await this.#fetchHandler.renderWithOptions(request, resolvedOptions);
    } else {
      setRenderOptions(request, resolvedOptions);
      Reflect.set(request, appSymbol, this);
      response = await this.#fetchHandler.fetch(request);
    }
    this.#warnMissingFeatures();
    if (response.headers.get(ASTRO_ERROR_HEADER)) {
      response.headers.delete(ASTRO_ERROR_HEADER);
      return this.renderError(request, {
        addCookieHeader,
        clientAddress,
        prerenderedErrorPageFetch,
        locals,
        routeData,
        waitUntil,
        response,
        status: response.status,
        error: response.status === 500 ? null : void 0
      });
    }
    return response;
  }
  setCookieHeaders(response) {
    return getSetCookiesFromResponse(response);
  }
  /**
   * Reads all the cookies written by `Astro.cookie.set()` onto the passed response.
   * For example,
   * ```ts
   * for (const cookie_ of App.getSetCookieFromResponse(response)) {
   *     const cookie: string = cookie_
   * }
   * ```
   * @param response The response to read cookies from.
   * @returns An iterator that yields key-value pairs as equal-sign-separated strings.
   */
  static getSetCookieFromResponse = getSetCookiesFromResponse;
  /**
   * If it is a known error code, try sending the according page (e.g. 404.astro / 500.astro).
   * This also handles pre-rendered /404 or /500 routes.
   *
   * Delegates to the app's configured `ErrorHandler`. To customize behavior
   * for a specific environment, override `createErrorHandler()` rather than
   * this method.
   */
  async renderError(request, options) {
    return this.#errorHandler.renderError(request, options);
  }
  /**
   * One-shot check: after the first request with a custom `src/app.ts`,
   * compare `usedFeatures` against the manifest and warn about any
   * configured features the user's pipeline doesn't call.
   */
  #warnMissingFeatures() {
    if (this.#featureCheckDone || !this.#hasCustomFetchHandler) return;
    this.#featureCheckDone = true;
    const manifest = this.manifest;
    const missing = [];
    const used = this.pipeline.usedFeatures;
    if (manifest.routes.some((r) => r.routeData.type === "redirect") && !(used & PipelineFeatures.redirects)) {
      missing.push("redirects");
    }
    if (manifest.sessionConfig && !(used & PipelineFeatures.sessions)) {
      missing.push("sessions");
    }
    if (manifest.actions && !(used & PipelineFeatures.actions)) {
      missing.push("actions");
    }
    if (manifest.middleware && !(used & PipelineFeatures.middleware)) {
      missing.push("middleware");
    }
    if (manifest.i18n && manifest.i18n.strategy !== "manual" && !(used & PipelineFeatures.i18n)) {
      missing.push("i18n");
    }
    if (manifest.cacheConfig && !(used & PipelineFeatures.cache)) {
      missing.push("cache");
    }
    for (const feature of missing) {
      this.logger.warn(
        "router",
        `Your project uses ${feature}, but your custom src/app.ts does not call the ${feature}() handler. This feature will not work unless you add it to your app.ts pipeline.`
      );
    }
  }
  getDefaultStatusCode(routeData, pathname) {
    if (!routeData.pattern.test(pathname)) {
      for (const fallbackRoute of routeData.fallbackRoutes) {
        if (fallbackRoute.pattern.test(pathname)) {
          return 302;
        }
      }
    }
    const route = removeTrailingForwardSlash(routeData.route);
    if (route.endsWith("/404")) return 404;
    if (route.endsWith("/500")) return 500;
    return 200;
  }
  getManifest() {
    return this.pipeline.manifest;
  }
  logThisRequest({
    pathname,
    method,
    statusCode,
    isRewrite,
    timeStart
  }) {
    const timeEnd = performance.now();
    this.logRequest({
      pathname,
      method,
      statusCode,
      isRewrite,
      reqTime: timeEnd - timeStart
    });
  }
}

function getAssetsPrefix(fileExtension, assetsPrefix) {
  let prefix = "";
  if (!assetsPrefix) {
    prefix = "";
  } else if (typeof assetsPrefix === "string") {
    prefix = assetsPrefix;
  } else {
    const dotLessFileExtension = fileExtension.slice(1);
    prefix = assetsPrefix[dotLessFileExtension] || assetsPrefix.fallback;
  }
  return prefix;
}

const URL_PARSE_BASE = "https://astro.build";
function splitAssetPath(path) {
  const parsed = new URL(path, URL_PARSE_BASE);
  const isAbsolute = URL.canParse(path);
  const pathname = !isAbsolute && !path.startsWith("/") ? parsed.pathname.slice(1) : parsed.pathname;
  return {
    pathname,
    suffix: `${parsed.search}${parsed.hash}`
  };
}
function createAssetLink(href, base, assetsPrefix, queryParams) {
  const { pathname, suffix } = splitAssetPath(href);
  let url = "";
  if (assetsPrefix) {
    const pf = getAssetsPrefix(fileExtension(pathname), assetsPrefix);
    url = joinPaths(pf, slash(pathname)) + suffix;
  } else if (base) {
    url = prependForwardSlash(joinPaths(base, slash(pathname))) + suffix;
  } else {
    url = href;
  }
  return url;
}
function createStylesheetElement(stylesheet, base, assetsPrefix, queryParams) {
  if (stylesheet.type === "inline") {
    return {
      props: {},
      children: stylesheet.content
    };
  } else {
    return {
      props: {
        rel: "stylesheet",
        href: createAssetLink(stylesheet.src, base, assetsPrefix)
      },
      children: ""
    };
  }
}
function createStylesheetElementSet(stylesheets, base, assetsPrefix, queryParams) {
  return new Set(
    stylesheets.map((s) => createStylesheetElement(s, base, assetsPrefix))
  );
}
function createModuleScriptElement(script, base, assetsPrefix, queryParams) {
  if (script.type === "external") {
    return createModuleScriptElementWithSrc(script.value, base, assetsPrefix);
  } else {
    return {
      props: {
        type: "module"
      },
      children: script.value
    };
  }
}
function createModuleScriptElementWithSrc(src, base, assetsPrefix, queryParams) {
  return {
    props: {
      type: "module",
      src: createAssetLink(src, base, assetsPrefix)
    },
    children: ""
  };
}

class AppPipeline extends Pipeline {
  getName() {
    return "AppPipeline";
  }
  static create({ manifest, streaming }) {
    const resolve = async function resolve2(specifier) {
      if (!(specifier in manifest.entryModules)) {
        throw new Error(`Unable to resolve [${specifier}]`);
      }
      const bundlePath = manifest.entryModules[specifier];
      if (bundlePath.startsWith("data:") || bundlePath.length === 0) {
        return bundlePath;
      } else {
        return createAssetLink(bundlePath, manifest.base, manifest.assetsPrefix);
      }
    };
    const logger = createConsoleLogger({ level: manifest.logLevel });
    const pipeline = new AppPipeline(
      logger,
      manifest,
      "production",
      manifest.renderers,
      resolve,
      streaming,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0
    );
    return pipeline;
  }
  async headElements(routeData) {
    const { assetsPrefix, base } = this.manifest;
    const routeInfo = this.manifest.routes.find(
      (route) => route.routeData.route === routeData.route
    );
    const links = /* @__PURE__ */ new Set();
    const scripts = /* @__PURE__ */ new Set();
    const styles = createStylesheetElementSet(routeInfo?.styles ?? [], base, assetsPrefix);
    for (const script of routeInfo?.scripts ?? []) {
      if ("stage" in script) {
        if (script.stage === "head-inline") {
          scripts.add({
            props: {},
            children: script.children
          });
        }
      } else {
        scripts.add(createModuleScriptElement(script, base, assetsPrefix));
      }
    }
    return { links, styles, scripts };
  }
  componentMetadata() {
  }
  async getComponentByRoute(routeData) {
    const module = await this.getModuleForRoute(routeData);
    return module.page();
  }
  async getModuleForRoute(route) {
    for (const defaultRoute of this.defaultRoutes) {
      if (route.component === defaultRoute.component) {
        return {
          page: () => Promise.resolve(defaultRoute.instance)
        };
      }
    }
    let routeToProcess = route;
    if (routeIsRedirect(route)) {
      if (route.redirectRoute) {
        routeToProcess = route.redirectRoute;
      } else {
        return RedirectSinglePageBuiltModule;
      }
    } else if (routeIsFallback(route)) {
      routeToProcess = getFallbackRoute(route, this.manifest.routes);
    }
    if (this.manifest.pageMap) {
      const importComponentInstance = this.manifest.pageMap.get(routeToProcess.component);
      if (!importComponentInstance) {
        throw new Error(
          `Unexpectedly unable to find a component instance for route ${route.route}`
        );
      }
      return await importComponentInstance();
    } else if (this.manifest.pageModule) {
      return this.manifest.pageModule;
    }
    throw new Error(
      "Astro couldn't find the correct page to render, probably because it wasn't correctly mapped for SSR usage. This is an internal error, please file an issue."
    );
  }
  async tryRewrite(payload, request) {
    const { newUrl, pathname, routeData } = findRouteToRewrite({
      payload,
      request,
      routes: this.manifest?.routes.map((r) => r.routeData),
      trailingSlash: this.manifest.trailingSlash,
      buildFormat: this.manifest.buildFormat,
      base: this.manifest.base,
      outDir: this.manifest?.serverLike ? this.manifest.buildClientDir : this.manifest.outDir
    });
    const componentInstance = await this.getComponentByRoute(routeData);
    return { newUrl, pathname, componentInstance, routeData };
  }
}

class App extends BaseApp {
  createPipeline(streaming) {
    return AppPipeline.create({
      manifest: this.manifest,
      streaming
    });
  }
  isDev() {
    return false;
  }
  // Should we log something for our users?
  logRequest(_options) {
  }
}

const contexts = /* @__PURE__ */ new WeakMap();
const ID_PREFIX = "r";
function getContext(rendererContextResult) {
  if (contexts.has(rendererContextResult)) {
    return contexts.get(rendererContextResult);
  }
  const ctx = {
    currentIndex: 0,
    get id() {
      return ID_PREFIX + this.currentIndex.toString();
    }
  };
  contexts.set(rendererContextResult, ctx);
  return ctx;
}
function incrementId(rendererContextResult) {
  const ctx = getContext(rendererContextResult);
  const id = ctx.id;
  ctx.currentIndex++;
  return id;
}

const StaticHtml = ({
  value,
  name,
  hydrate = true
}) => {
  if (value == null || value.trim() === "") return null;
  const tagName = hydrate ? "astro-slot" : "astro-static-slot";
  return createElement(tagName, {
    name,
    suppressHydrationWarning: true,
    dangerouslySetInnerHTML: { __html: value }
  });
};
var static_html_default = memo(StaticHtml, () => true);

const slotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
const reactTypeof = /* @__PURE__ */ Symbol.for("react.element");
const reactTransitionalTypeof = /* @__PURE__ */ Symbol.for("react.transitional.element");
async function check(Component, props, children, metadata) {
  if (typeof Component === "object") {
    return Component["$$typeof"].toString().slice("Symbol(".length).startsWith("react");
  }
  if (typeof Component !== "function") return false;
  if (Component.name === "QwikComponent") return false;
  if (typeof Component === "function" && Component["$$typeof"] === /* @__PURE__ */ Symbol.for("react.forward_ref"))
    return false;
  if (Component.prototype != null && typeof Component.prototype.render === "function") {
    return React.Component.isPrototypeOf(Component) || React.PureComponent.isPrototypeOf(Component);
  }
  let isReactComponent = false;
  function Tester(...args) {
    try {
      const vnode = Component(...args);
      if (vnode && (vnode["$$typeof"] === reactTypeof || vnode["$$typeof"] === reactTransitionalTypeof)) {
        isReactComponent = true;
      }
    } catch {
    }
    return React.createElement("div");
  }
  await renderToStaticMarkup.call(this, Tester, props, children);
  return isReactComponent;
}
async function getNodeWritable() {
  let nodeStreamBuiltinModuleName = "node:stream";
  let { Writable } = await import(
    /* @vite-ignore */
    nodeStreamBuiltinModuleName
  );
  return Writable;
}
function needsHydration(metadata) {
  return metadata?.astroStaticSlot ? !!metadata.hydrate : true;
}
async function renderToStaticMarkup(Component, props, { default: children, ...slotted }, metadata) {
  let prefix;
  if (this && this.result) {
    prefix = incrementId(this.result);
  }
  const attrs = { prefix };
  delete props["class"];
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = React.createElement(static_html_default, {
      hydrate: needsHydration(metadata),
      value,
      name
    });
  }
  const newProps = {
    ...props,
    ...slots
  };
  const newChildren = children ?? props.children;
  if (newChildren != null) {
    newProps.children = React.createElement(static_html_default, {
      hydrate: needsHydration(metadata),
      value: newChildren
    });
  }
  const formState = this ? await getFormState(this) : void 0;
  if (formState) {
    attrs["data-action-result"] = JSON.stringify(formState[0]);
    attrs["data-action-key"] = formState[1];
    attrs["data-action-name"] = formState[2];
  }
  const vnode = React.createElement(Component, newProps);
  const renderOptions = {
    identifierPrefix: prefix,
    formState
  };
  let html;
  if ("renderToReadableStream" in ReactDOM) {
    html = await renderToReadableStreamAsync(vnode, renderOptions);
  } else {
    html = await renderToPipeableStreamAsync(vnode, renderOptions);
  }
  html = html.replace(
    /<link\s[^>]*rel="(?:preload|modulepreload|stylesheet|preconnect|dns-prefetch)"[^>]*>/g,
    ""
  );
  return { html, attrs };
}
async function getFormState({
  result
}) {
  const { request, actionResult } = result;
  if (!actionResult) return void 0;
  if (!isFormRequest(request.headers.get("content-type"))) return void 0;
  const { searchParams } = new URL(request.url);
  const formData = await request.clone().formData();
  const actionKey = formData.get("$ACTION_KEY")?.toString();
  const actionName = searchParams.get("_action");
  if (!actionKey || !actionName) return void 0;
  return [actionResult, actionKey, actionName];
}
async function renderToPipeableStreamAsync(vnode, options) {
  const Writable = await getNodeWritable();
  let html = "";
  return new Promise((resolve, reject) => {
    let error = void 0;
    let stream = ReactDOM.renderToPipeableStream(vnode, {
      ...options,
      onError(err) {
        error = err;
        reject(error);
      },
      onAllReady() {
        stream.pipe(
          new Writable({
            write(chunk, _encoding, callback) {
              html += chunk.toString("utf-8");
              callback();
            },
            destroy() {
              resolve(html);
            }
          })
        );
      }
    });
  });
}
async function readResult(stream) {
  const reader = stream.getReader();
  let result = "";
  const decoder = new TextDecoder("utf-8");
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      if (value) {
        result += decoder.decode(value);
      } else {
        decoder.decode(new Uint8Array());
      }
      return result;
    }
    result += decoder.decode(value, { stream: true });
  }
}
async function renderToReadableStreamAsync(vnode, options) {
  return await readResult(await ReactDOM.renderToReadableStream(vnode, options));
}
const formContentTypes = ["application/x-www-form-urlencoded", "multipart/form-data"];
function isFormRequest(contentType) {
  const type = contentType?.split(";")[0].toLowerCase();
  return formContentTypes.some((t) => type === t);
}
const renderer = {
  name: "@astrojs/react",
  check,
  renderToStaticMarkup,
  supportsAstroStaticSlot: true
};
var server_default = renderer;

const renderers = [Object.assign({"name":"@astrojs/react","clientEntrypoint":"@astrojs/react/client.js","serverEntrypoint":"@astrojs/react/server.js"}, { ssr: server_default }),];

const serializedData = [{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","distURL":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/_image","component":"node_modules/astro/dist/assets/endpoint/generic.js","params":[],"pathname":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"type":"endpoint","prerender":false,"fallbackRoutes":[],"distURL":[],"isIndex":false,"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/404","isIndex":false,"type":"page","pattern":"^\\/404\\/?$","segments":[[{"content":"404","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/404.astro","pathname":"/404","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/admin/categorias/editar/[id]","isIndex":false,"type":"page","pattern":"^\\/admin\\/categorias\\/editar\\/([^/]+?)\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"categorias","dynamic":false,"spread":false}],[{"content":"editar","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/admin/categorias/editar/[id].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/admin/categorias","isIndex":true,"type":"page","pattern":"^\\/admin\\/categorias\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"categorias","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/categorias/index.astro","pathname":"/admin/categorias","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/admin/productos","isIndex":true,"type":"page","pattern":"^\\/admin\\/productos\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"productos","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/productos/index.astro","pathname":"/admin/productos","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/admin/proyectos","isIndex":true,"type":"page","pattern":"^\\/admin\\/proyectos\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"proyectos","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/proyectos/index.astro","pathname":"/admin/proyectos","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/admin/reclamaciones","isIndex":true,"type":"page","pattern":"^\\/admin\\/reclamaciones\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"reclamaciones","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/reclamaciones/index.astro","pathname":"/admin/reclamaciones","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/admin/servicios","isIndex":true,"type":"page","pattern":"^\\/admin\\/servicios\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"servicios","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/servicios/index.astro","pathname":"/admin/servicios","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/admin/subcategorias","isIndex":true,"type":"page","pattern":"^\\/admin\\/subcategorias\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"subcategorias","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/subcategorias/index.astro","pathname":"/admin/subcategorias","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/admin/suscriptores","isIndex":true,"type":"page","pattern":"^\\/admin\\/suscriptores\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"suscriptores","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/suscriptores/index.astro","pathname":"/admin/suscriptores","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/admin/tutoriales/categorias","isIndex":true,"type":"page","pattern":"^\\/admin\\/tutoriales\\/categorias\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"tutoriales","dynamic":false,"spread":false}],[{"content":"categorias","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/tutoriales/categorias/index.astro","pathname":"/admin/tutoriales/categorias","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/admin/tutoriales/subcategorias","isIndex":true,"type":"page","pattern":"^\\/admin\\/tutoriales\\/subcategorias\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"tutoriales","dynamic":false,"spread":false}],[{"content":"subcategorias","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/tutoriales/subcategorias/index.astro","pathname":"/admin/tutoriales/subcategorias","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/admin/tutoriales","isIndex":true,"type":"page","pattern":"^\\/admin\\/tutoriales\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"tutoriales","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/tutoriales/index.astro","pathname":"/admin/tutoriales","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/admin","isIndex":true,"type":"page","pattern":"^\\/admin\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/index.astro","pathname":"/admin","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/categorias/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/categorias\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"categorias","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/admin/categorias/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/categorias","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/categorias\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"categorias","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/categorias.ts","pathname":"/api/admin/categorias","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/productos/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/productos\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"productos","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/admin/productos/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/productos","isIndex":true,"type":"endpoint","pattern":"^\\/api\\/admin\\/productos\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"productos","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/productos/index.ts","pathname":"/api/admin/productos","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/proyectos/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/proyectos\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"proyectos","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/admin/proyectos/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/proyectos","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/proyectos\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"proyectos","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/proyectos.ts","pathname":"/api/admin/proyectos","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/reclamaciones/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/reclamaciones\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"reclamaciones","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/admin/reclamaciones/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/servicios/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/servicios\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"servicios","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/admin/servicios/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/servicios","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/servicios\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"servicios","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/servicios.ts","pathname":"/api/admin/servicios","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/subcategorias/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/subcategorias\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"subcategorias","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/admin/subcategorias/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/subcategorias","isIndex":true,"type":"endpoint","pattern":"^\\/api\\/admin\\/subcategorias\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"subcategorias","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/subcategorias/index.ts","pathname":"/api/admin/subcategorias","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/suscriptores/exportar","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/suscriptores\\/exportar\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"suscriptores","dynamic":false,"spread":false}],[{"content":"exportar","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/suscriptores/exportar.ts","pathname":"/api/admin/suscriptores/exportar","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/tutorial-categorias/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/tutorial-categorias\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"tutorial-categorias","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/admin/tutorial-categorias/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/tutorial-categorias","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/tutorial-categorias\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"tutorial-categorias","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/tutorial-categorias.ts","pathname":"/api/admin/tutorial-categorias","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/tutorial-subcategorias/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/tutorial-subcategorias\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"tutorial-subcategorias","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/admin/tutorial-subcategorias/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/tutorial-subcategorias","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/tutorial-subcategorias\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"tutorial-subcategorias","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/tutorial-subcategorias.ts","pathname":"/api/admin/tutorial-subcategorias","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/reclamaciones","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/reclamaciones\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"reclamaciones","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/reclamaciones.ts","pathname":"/api/reclamaciones","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/suscribir","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/suscribir\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"suscribir","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/suscribir.ts","pathname":"/api/suscribir","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/tutorials/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/tutorials\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"tutorials","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/tutorials/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/tutorials","isIndex":true,"type":"endpoint","pattern":"^\\/api\\/tutorials\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"tutorials","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/tutorials/index.ts","pathname":"/api/tutorials","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/buscar","isIndex":false,"type":"page","pattern":"^\\/buscar\\/?$","segments":[[{"content":"buscar","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/buscar.astro","pathname":"/buscar","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/categorias/actuadores/modulacion-electronica","isIndex":false,"type":"page","pattern":"^\\/categorias\\/actuadores\\/modulacion-electronica\\/?$","segments":[[{"content":"categorias","dynamic":false,"spread":false}],[{"content":"actuadores","dynamic":false,"spread":false}],[{"content":"modulacion-electronica","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/categorias/actuadores/modulacion-electronica.astro","pathname":"/categorias/actuadores/modulacion-electronica","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/categorias/[categorySlug]","isIndex":false,"type":"page","pattern":"^\\/categorias\\/([^/]+?)\\/?$","segments":[[{"content":"categorias","dynamic":false,"spread":false}],[{"content":"categorySlug","dynamic":true,"spread":false}]],"params":["categorySlug"],"component":"src/pages/categorias/[categorySlug].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/contacto","isIndex":false,"type":"page","pattern":"^\\/contacto\\/?$","segments":[[{"content":"contacto","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/contacto.astro","pathname":"/contacto","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/libro-reclamaciones","isIndex":false,"type":"page","pattern":"^\\/libro-reclamaciones\\/?$","segments":[[{"content":"libro-reclamaciones","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/libro-reclamaciones.astro","pathname":"/libro-reclamaciones","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/nosotros","isIndex":false,"type":"page","pattern":"^\\/nosotros\\/?$","segments":[[{"content":"nosotros","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/nosotros.astro","pathname":"/nosotros","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/productos/[slug]","isIndex":false,"type":"page","pattern":"^\\/productos\\/([^/]+?)\\/?$","segments":[[{"content":"productos","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/productos/[slug].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/productos","isIndex":true,"type":"page","pattern":"^\\/productos\\/?$","segments":[[{"content":"productos","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/productos/index.astro","pathname":"/productos","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/proyectos/[id]","isIndex":false,"type":"page","pattern":"^\\/proyectos\\/([^/]+?)\\/?$","segments":[[{"content":"proyectos","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/proyectos/[id].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/proyectos","isIndex":false,"type":"page","pattern":"^\\/proyectos\\/?$","segments":[[{"content":"proyectos","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/proyectos.astro","pathname":"/proyectos","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/servicios","isIndex":false,"type":"page","pattern":"^\\/servicios\\/?$","segments":[[{"content":"servicios","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/servicios.astro","pathname":"/servicios","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/tutoriales/categoria/[categoria]","isIndex":false,"type":"page","pattern":"^\\/tutoriales\\/categoria\\/([^/]+?)\\/?$","segments":[[{"content":"tutoriales","dynamic":false,"spread":false}],[{"content":"categoria","dynamic":false,"spread":false}],[{"content":"categoria","dynamic":true,"spread":false}]],"params":["categoria"],"component":"src/pages/tutoriales/categoria/[categoria].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/tutoriales/[id]","isIndex":false,"type":"page","pattern":"^\\/tutoriales\\/([^/]+?)\\/?$","segments":[[{"content":"tutoriales","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/tutoriales/[id].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/tutoriales","isIndex":true,"type":"page","pattern":"^\\/tutoriales\\/?$","segments":[[{"content":"tutoriales","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/tutoriales/index.astro","pathname":"/tutoriales","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}];
				serializedData.map(deserializeRouteInfo);

const _page0 = () => import('./generic_BexXW-gQ.mjs').then(n => n.g);
const _page1 = () => import('./404_Dm03Ah6N.mjs');
const _page2 = () => import('./_id__voVmfXiI.mjs');
const _page3 = () => import('./index_D5Hlv8aT.mjs');
const _page4 = () => import('./index_Bb6kdwIW.mjs');
const _page5 = () => import('./index_C45MH2fI.mjs');
const _page6 = () => import('./index_C9kCHikC.mjs');
const _page7 = () => import('./index_t2eU7RLQ.mjs');
const _page8 = () => import('./index_BC7hqtT-.mjs');
const _page9 = () => import('./index_BW4_Ps4B.mjs');
const _page10 = () => import('./index_GK9ck7Oy.mjs');
const _page11 = () => import('./index_z9tBQG9e.mjs');
const _page12 = () => import('./index_N8c_Ux4B.mjs');
const _page13 = () => import('./index_COwlUfVV.mjs');
const _page14 = () => import('./_id__-uy8aJFE.mjs');
const _page15 = () => import('./categorias_K7P7bcQ8.mjs');
const _page16 = () => import('./_id__BrYHqUdj.mjs');
const _page17 = () => import('./index_DXj7-EeI.mjs');
const _page18 = () => import('./_id__BPwsqa9O.mjs');
const _page19 = () => import('./proyectos_SwmvYppo.mjs');
const _page20 = () => import('./_id__CY_99Hsc.mjs');
const _page21 = () => import('./_id__D8G91dgj.mjs');
const _page22 = () => import('./servicios_CLiZgrZQ.mjs');
const _page23 = () => import('./_id__B-OkSpeE.mjs');
const _page24 = () => import('./index_B0Ih_jg-.mjs');
const _page25 = () => import('./exportar_D2-caw2V.mjs');
const _page26 = () => import('./_id__3SjHc-u6.mjs');
const _page27 = () => import('./tutorial-categorias_CkKYahEj.mjs');
const _page28 = () => import('./_id__Btt5w-Pd.mjs');
const _page29 = () => import('./tutorial-subcategorias_CGB7C_bj.mjs');
const _page30 = () => import('./reclamaciones_BrMHn1YC.mjs');
const _page31 = () => import('./suscribir_tzsraayZ.mjs');
const _page32 = () => import('./_id__3GJI9s7o.mjs');
const _page33 = () => import('./index_DMvkBZbP.mjs');
const _page34 = () => import('./buscar_D6TAwKRf.mjs');
const _page35 = () => import('./modulacion-electronica_COh4rvUC.mjs');
const _page36 = () => import('./_categorySlug__BNgExR2T.mjs');
const _page37 = () => import('./contacto_CopTzmTY.mjs');
const _page38 = () => import('./libro-reclamaciones_xbUezLye.mjs');
const _page39 = () => import('./nosotros_sybeHtbb.mjs');
const _page40 = () => import('./_slug__NV4zL29n.mjs');
const _page41 = () => import('./index_PwDphrCX.mjs');
const _page42 = () => import('./_id__Cfn_Tspx.mjs');
const _page43 = () => import('./proyectos_CA4E60Vs.mjs');
const _page44 = () => import('./servicios_Dt5ktQ-b.mjs');
const _page45 = () => import('./_categoria__BJNEgopQ.mjs');
const _page46 = () => import('./_id__D-7pAgNz.mjs');
const _page47 = () => import('./index_CE0k7DI1.mjs');
const _page48 = () => import('./index_CMqmBFzT.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/admin/categorias/editar/[id].astro", _page2],
    ["src/pages/admin/categorias/index.astro", _page3],
    ["src/pages/admin/productos/index.astro", _page4],
    ["src/pages/admin/proyectos/index.astro", _page5],
    ["src/pages/admin/reclamaciones/index.astro", _page6],
    ["src/pages/admin/servicios/index.astro", _page7],
    ["src/pages/admin/subcategorias/index.astro", _page8],
    ["src/pages/admin/suscriptores/index.astro", _page9],
    ["src/pages/admin/tutoriales/categorias/index.astro", _page10],
    ["src/pages/admin/tutoriales/subcategorias/index.astro", _page11],
    ["src/pages/admin/tutoriales/index.astro", _page12],
    ["src/pages/admin/index.astro", _page13],
    ["src/pages/api/admin/categorias/[id].ts", _page14],
    ["src/pages/api/admin/categorias.ts", _page15],
    ["src/pages/api/admin/productos/[id].ts", _page16],
    ["src/pages/api/admin/productos/index.ts", _page17],
    ["src/pages/api/admin/proyectos/[id].ts", _page18],
    ["src/pages/api/admin/proyectos.ts", _page19],
    ["src/pages/api/admin/reclamaciones/[id].ts", _page20],
    ["src/pages/api/admin/servicios/[id].ts", _page21],
    ["src/pages/api/admin/servicios.ts", _page22],
    ["src/pages/api/admin/subcategorias/[id].ts", _page23],
    ["src/pages/api/admin/subcategorias/index.ts", _page24],
    ["src/pages/api/admin/suscriptores/exportar.ts", _page25],
    ["src/pages/api/admin/tutorial-categorias/[id].ts", _page26],
    ["src/pages/api/admin/tutorial-categorias.ts", _page27],
    ["src/pages/api/admin/tutorial-subcategorias/[id].ts", _page28],
    ["src/pages/api/admin/tutorial-subcategorias.ts", _page29],
    ["src/pages/api/reclamaciones.ts", _page30],
    ["src/pages/api/suscribir.ts", _page31],
    ["src/pages/api/tutorials/[id].ts", _page32],
    ["src/pages/api/tutorials/index.ts", _page33],
    ["src/pages/buscar.astro", _page34],
    ["src/pages/categorias/actuadores/modulacion-electronica.astro", _page35],
    ["src/pages/categorias/[categorySlug].astro", _page36],
    ["src/pages/contacto.astro", _page37],
    ["src/pages/libro-reclamaciones.astro", _page38],
    ["src/pages/nosotros.astro", _page39],
    ["src/pages/productos/[slug].astro", _page40],
    ["src/pages/productos/index.astro", _page41],
    ["src/pages/proyectos/[id].astro", _page42],
    ["src/pages/proyectos.astro", _page43],
    ["src/pages/servicios.astro", _page44],
    ["src/pages/tutoriales/categoria/[categoria].astro", _page45],
    ["src/pages/tutoriales/[id].astro", _page46],
    ["src/pages/tutoriales/index.astro", _page47],
    ["src/pages/index.astro", _page48]
]);

const _manifest = deserializeManifest(({"rootDir":"file:///D:/Proyectos/heatperu/","cacheDir":"file:///D:/Proyectos/heatperu/node_modules/.astro/","outDir":"file:///D:/Proyectos/heatperu/dist/","srcDir":"file:///D:/Proyectos/heatperu/src/","publicDir":"file:///D:/Proyectos/heatperu/public/","buildClientDir":"file:///D:/Proyectos/heatperu/dist/client/","buildServerDir":"file:///D:/Proyectos/heatperu/dist/server/","adapterName":"@astrojs/vercel","assetsDir":"_astro","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","distURL":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/_image","component":"node_modules/astro/dist/assets/endpoint/generic.js","params":[],"pathname":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"type":"endpoint","prerender":false,"fallbackRoutes":[],"distURL":[],"isIndex":false,"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"}],"routeData":{"route":"/404","isIndex":false,"type":"page","pattern":"^\\/404\\/?$","segments":[[{"content":"404","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/404.astro","pathname":"/404","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"}],"routeData":{"route":"/admin/categorias/editar/[id]","isIndex":false,"type":"page","pattern":"^\\/admin\\/categorias\\/editar\\/([^/]+?)\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"categorias","dynamic":false,"spread":false}],[{"content":"editar","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/admin/categorias/editar/[id].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"}],"routeData":{"route":"/admin/categorias","isIndex":true,"type":"page","pattern":"^\\/admin\\/categorias\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"categorias","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/categorias/index.astro","pathname":"/admin/categorias","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"},{"type":"external","src":"_astro/index.t7x-dYDo.css"}],"routeData":{"route":"/admin/productos","isIndex":true,"type":"page","pattern":"^\\/admin\\/productos\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"productos","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/productos/index.astro","pathname":"/admin/productos","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"},{"type":"external","src":"_astro/index.t7x-dYDo.css"}],"routeData":{"route":"/admin/proyectos","isIndex":true,"type":"page","pattern":"^\\/admin\\/proyectos\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"proyectos","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/proyectos/index.astro","pathname":"/admin/proyectos","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"}],"routeData":{"route":"/admin/reclamaciones","isIndex":true,"type":"page","pattern":"^\\/admin\\/reclamaciones\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"reclamaciones","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/reclamaciones/index.astro","pathname":"/admin/reclamaciones","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"},{"type":"external","src":"_astro/index.t7x-dYDo.css"}],"routeData":{"route":"/admin/servicios","isIndex":true,"type":"page","pattern":"^\\/admin\\/servicios\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"servicios","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/servicios/index.astro","pathname":"/admin/servicios","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"}],"routeData":{"route":"/admin/subcategorias","isIndex":true,"type":"page","pattern":"^\\/admin\\/subcategorias\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"subcategorias","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/subcategorias/index.astro","pathname":"/admin/subcategorias","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"}],"routeData":{"route":"/admin/suscriptores","isIndex":true,"type":"page","pattern":"^\\/admin\\/suscriptores\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"suscriptores","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/suscriptores/index.astro","pathname":"/admin/suscriptores","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"}],"routeData":{"route":"/admin/tutoriales/categorias","isIndex":true,"type":"page","pattern":"^\\/admin\\/tutoriales\\/categorias\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"tutoriales","dynamic":false,"spread":false}],[{"content":"categorias","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/tutoriales/categorias/index.astro","pathname":"/admin/tutoriales/categorias","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"}],"routeData":{"route":"/admin/tutoriales/subcategorias","isIndex":true,"type":"page","pattern":"^\\/admin\\/tutoriales\\/subcategorias\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"tutoriales","dynamic":false,"spread":false}],[{"content":"subcategorias","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/tutoriales/subcategorias/index.astro","pathname":"/admin/tutoriales/subcategorias","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"},{"type":"external","src":"_astro/index.t7x-dYDo.css"}],"routeData":{"route":"/admin/tutoriales","isIndex":true,"type":"page","pattern":"^\\/admin\\/tutoriales\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"tutoriales","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/tutoriales/index.astro","pathname":"/admin/tutoriales","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"}],"routeData":{"route":"/admin","isIndex":true,"type":"page","pattern":"^\\/admin\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/index.astro","pathname":"/admin","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/categorias/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/categorias\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"categorias","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/admin/categorias/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/categorias","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/categorias\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"categorias","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/categorias.ts","pathname":"/api/admin/categorias","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/productos/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/productos\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"productos","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/admin/productos/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/productos","isIndex":true,"type":"endpoint","pattern":"^\\/api\\/admin\\/productos\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"productos","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/productos/index.ts","pathname":"/api/admin/productos","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/proyectos/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/proyectos\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"proyectos","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/admin/proyectos/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/proyectos","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/proyectos\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"proyectos","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/proyectos.ts","pathname":"/api/admin/proyectos","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/reclamaciones/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/reclamaciones\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"reclamaciones","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/admin/reclamaciones/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/servicios/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/servicios\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"servicios","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/admin/servicios/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/servicios","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/servicios\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"servicios","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/servicios.ts","pathname":"/api/admin/servicios","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/subcategorias/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/subcategorias\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"subcategorias","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/admin/subcategorias/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/subcategorias","isIndex":true,"type":"endpoint","pattern":"^\\/api\\/admin\\/subcategorias\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"subcategorias","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/subcategorias/index.ts","pathname":"/api/admin/subcategorias","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/suscriptores/exportar","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/suscriptores\\/exportar\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"suscriptores","dynamic":false,"spread":false}],[{"content":"exportar","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/suscriptores/exportar.ts","pathname":"/api/admin/suscriptores/exportar","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/tutorial-categorias/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/tutorial-categorias\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"tutorial-categorias","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/admin/tutorial-categorias/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/tutorial-categorias","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/tutorial-categorias\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"tutorial-categorias","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/tutorial-categorias.ts","pathname":"/api/admin/tutorial-categorias","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/tutorial-subcategorias/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/tutorial-subcategorias\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"tutorial-subcategorias","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/admin/tutorial-subcategorias/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/tutorial-subcategorias","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/tutorial-subcategorias\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"tutorial-subcategorias","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/tutorial-subcategorias.ts","pathname":"/api/admin/tutorial-subcategorias","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/reclamaciones","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/reclamaciones\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"reclamaciones","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/reclamaciones.ts","pathname":"/api/reclamaciones","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/suscribir","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/suscribir\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"suscribir","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/suscribir.ts","pathname":"/api/suscribir","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/tutorials/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/tutorials\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"tutorials","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/tutorials/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/tutorials","isIndex":true,"type":"endpoint","pattern":"^\\/api\\/tutorials\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"tutorials","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/tutorials/index.ts","pathname":"/api/tutorials","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"},{"type":"inline","content":"@keyframes fadeInUp{0%{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.animate-fade-in-up[data-astro-cid-wu5dj4rx]{animation:fadeInUp 1s cubic-bezier(.16,1,.3,1) forwards}\n"}],"routeData":{"route":"/buscar","isIndex":false,"type":"page","pattern":"^\\/buscar\\/?$","segments":[[{"content":"buscar","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/buscar.astro","pathname":"/buscar","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"},{"type":"inline","content":"@keyframes fadeInUp{0%{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.animate-fade-in-up[data-astro-cid-wu5dj4rx]{animation:fadeInUp 1s cubic-bezier(.16,1,.3,1) forwards}\n"}],"routeData":{"route":"/categorias/actuadores/modulacion-electronica","isIndex":false,"type":"page","pattern":"^\\/categorias\\/actuadores\\/modulacion-electronica\\/?$","segments":[[{"content":"categorias","dynamic":false,"spread":false}],[{"content":"actuadores","dynamic":false,"spread":false}],[{"content":"modulacion-electronica","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/categorias/actuadores/modulacion-electronica.astro","pathname":"/categorias/actuadores/modulacion-electronica","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"},{"type":"inline","content":"@keyframes fadeInUp{0%{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.animate-fade-in-up[data-astro-cid-wu5dj4rx]{animation:fadeInUp 1s cubic-bezier(.16,1,.3,1) forwards}\n"}],"routeData":{"route":"/categorias/[categorySlug]","isIndex":false,"type":"page","pattern":"^\\/categorias\\/([^/]+?)\\/?$","segments":[[{"content":"categorias","dynamic":false,"spread":false}],[{"content":"categorySlug","dynamic":true,"spread":false}]],"params":["categorySlug"],"component":"src/pages/categorias/[categorySlug].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"},{"type":"inline","content":"@keyframes fadeInUp{0%{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.animate-fade-in-up[data-astro-cid-wu5dj4rx]{animation:fadeInUp 1s cubic-bezier(.16,1,.3,1) forwards}\n"}],"routeData":{"route":"/contacto","isIndex":false,"type":"page","pattern":"^\\/contacto\\/?$","segments":[[{"content":"contacto","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/contacto.astro","pathname":"/contacto","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"}],"routeData":{"route":"/libro-reclamaciones","isIndex":false,"type":"page","pattern":"^\\/libro-reclamaciones\\/?$","segments":[[{"content":"libro-reclamaciones","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/libro-reclamaciones.astro","pathname":"/libro-reclamaciones","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"},{"type":"inline","content":"@keyframes fadeInUp{0%{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.animate-fade-in-up[data-astro-cid-wu5dj4rx]{animation:fadeInUp 1s cubic-bezier(.16,1,.3,1) forwards}\n"}],"routeData":{"route":"/nosotros","isIndex":false,"type":"page","pattern":"^\\/nosotros\\/?$","segments":[[{"content":"nosotros","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/nosotros.astro","pathname":"/nosotros","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"},{"type":"inline","content":"@keyframes fadeInUp{0%{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.animate-fade-in-up[data-astro-cid-wu5dj4rx]{animation:fadeInUp 1s cubic-bezier(.16,1,.3,1) forwards}\n.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}.hide-scrollbar::-webkit-scrollbar{display:none}\n"}],"routeData":{"route":"/productos/[slug]","isIndex":false,"type":"page","pattern":"^\\/productos\\/([^/]+?)\\/?$","segments":[[{"content":"productos","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/productos/[slug].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"},{"type":"inline","content":"@keyframes fadeInUp{0%{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.animate-fade-in-up[data-astro-cid-wu5dj4rx]{animation:fadeInUp 1s cubic-bezier(.16,1,.3,1) forwards}\n"}],"routeData":{"route":"/productos","isIndex":true,"type":"page","pattern":"^\\/productos\\/?$","segments":[[{"content":"productos","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/productos/index.astro","pathname":"/productos","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"},{"type":"inline","content":"@keyframes fadeInUp{0%{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.animate-fade-in-up[data-astro-cid-wu5dj4rx]{animation:fadeInUp 1s cubic-bezier(.16,1,.3,1) forwards}\n"}],"routeData":{"route":"/proyectos/[id]","isIndex":false,"type":"page","pattern":"^\\/proyectos\\/([^/]+?)\\/?$","segments":[[{"content":"proyectos","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/proyectos/[id].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"},{"type":"inline","content":"@keyframes fadeInUp{0%{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.animate-fade-in-up[data-astro-cid-wu5dj4rx]{animation:fadeInUp 1s cubic-bezier(.16,1,.3,1) forwards}\n"}],"routeData":{"route":"/proyectos","isIndex":false,"type":"page","pattern":"^\\/proyectos\\/?$","segments":[[{"content":"proyectos","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/proyectos.astro","pathname":"/proyectos","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"},{"type":"inline","content":"@keyframes fadeInUp{0%{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.animate-fade-in-up[data-astro-cid-wu5dj4rx]{animation:fadeInUp 1s cubic-bezier(.16,1,.3,1) forwards}\n"}],"routeData":{"route":"/servicios","isIndex":false,"type":"page","pattern":"^\\/servicios\\/?$","segments":[[{"content":"servicios","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/servicios.astro","pathname":"/servicios","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"},{"type":"inline","content":"@keyframes fadeInUp{0%{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.animate-fade-in-up[data-astro-cid-wu5dj4rx]{animation:fadeInUp 1s cubic-bezier(.16,1,.3,1) forwards}\n"}],"routeData":{"route":"/tutoriales/categoria/[categoria]","isIndex":false,"type":"page","pattern":"^\\/tutoriales\\/categoria\\/([^/]+?)\\/?$","segments":[[{"content":"tutoriales","dynamic":false,"spread":false}],[{"content":"categoria","dynamic":false,"spread":false}],[{"content":"categoria","dynamic":true,"spread":false}]],"params":["categoria"],"component":"src/pages/tutoriales/categoria/[categoria].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"},{"type":"inline","content":"@keyframes fadeInUp{0%{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.animate-fade-in-up[data-astro-cid-wu5dj4rx]{animation:fadeInUp 1s cubic-bezier(.16,1,.3,1) forwards}\n"}],"routeData":{"route":"/tutoriales/[id]","isIndex":false,"type":"page","pattern":"^\\/tutoriales\\/([^/]+?)\\/?$","segments":[[{"content":"tutoriales","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/tutoriales/[id].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"},{"type":"inline","content":"@keyframes fadeInUp{0%{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.animate-fade-in-up[data-astro-cid-wu5dj4rx]{animation:fadeInUp 1s cubic-bezier(.16,1,.3,1) forwards}\n"}],"routeData":{"route":"/tutoriales","isIndex":true,"type":"page","pattern":"^\\/tutoriales\\/?$","segments":[[{"content":"tutoriales","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/tutoriales/index.astro","pathname":"/tutoriales","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"_astro/global.UuHrztoz.css"},{"type":"inline","content":".animate-marquee[data-astro-cid-idpakhbp]{animation:marquee 40s linear infinite}.animate-marquee2[data-astro-cid-idpakhbp]{animation:marquee2 40s linear infinite}.group[data-astro-cid-idpakhbp]:hover .animate-marquee[data-astro-cid-idpakhbp],.group[data-astro-cid-idpakhbp]:hover .animate-marquee2[data-astro-cid-idpakhbp]{animation-play-state:paused}@keyframes marquee{0%{transform:translate(0)}to{transform:translate(-100%)}}@keyframes marquee2{0%{transform:translate(100%)}to{transform:translate(0)}}\n"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"serverLike":true,"middlewareMode":"classic","base":"/","trailingSlash":"ignore","compressHTML":true,"experimentalQueuedRendering":{"enabled":false,"poolSize":0,"contentCache":false},"componentMetadata":[["D:/Proyectos/heatperu/src/pages/admin/categorias/editar/[id].astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/admin/categorias/index.astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/admin/index.astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/admin/productos/index.astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/admin/proyectos/index.astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/admin/reclamaciones/index.astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/admin/servicios/index.astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/admin/subcategorias/index.astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/admin/suscriptores/index.astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/admin/tutoriales/categorias/index.astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/admin/tutoriales/index.astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/admin/tutoriales/subcategorias/index.astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/404.astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/buscar.astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/categorias/[categorySlug].astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/categorias/actuadores/modulacion-electronica.astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/contacto.astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/index.astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/libro-reclamaciones.astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/nosotros.astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/productos/[slug].astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/productos/index.astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/proyectos.astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/proyectos/[id].astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/servicios.astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/tutoriales/[id].astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/tutoriales/categoria/[categoria].astro",{"propagation":"none","containsHead":true}],["D:/Proyectos/heatperu/src/pages/tutoriales/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"astro/entrypoints/prerender":"prerender-entry.BZU0_elk.mjs","\u0000virtual:astro:actions/noop-entrypoint":"chunks/noop-entrypoint_BOlrdqWF.mjs","\u0000noop-middleware":"virtual_astro_middleware.mjs","\u0000virtual:astro:session-driver":"chunks/_virtual_astro_session-driver_DYx9Bb3p.mjs","\u0000virtual:astro:server-island-manifest":"chunks/_virtual_astro_server-island-manifest_CQQ1F5PF.mjs","@astrojs/vercel/entrypoint":"entry.mjs","\u0000virtual:astro:page:src/pages/404@_@astro":"chunks/404_Dm03Ah6N.mjs","\u0000virtual:astro:page:src/pages/admin/categorias/editar/[id]@_@astro":"chunks/_id__voVmfXiI.mjs","\u0000virtual:astro:page:src/pages/admin/categorias/index@_@astro":"chunks/index_D5Hlv8aT.mjs","\u0000virtual:astro:page:src/pages/admin/productos/index@_@astro":"chunks/index_Bb6kdwIW.mjs","\u0000virtual:astro:page:src/pages/admin/proyectos/index@_@astro":"chunks/index_C45MH2fI.mjs","\u0000virtual:astro:page:src/pages/admin/reclamaciones/index@_@astro":"chunks/index_C9kCHikC.mjs","\u0000virtual:astro:page:src/pages/admin/servicios/index@_@astro":"chunks/index_t2eU7RLQ.mjs","\u0000virtual:astro:page:src/pages/admin/subcategorias/index@_@astro":"chunks/index_BC7hqtT-.mjs","\u0000virtual:astro:page:src/pages/admin/suscriptores/index@_@astro":"chunks/index_BW4_Ps4B.mjs","\u0000virtual:astro:page:src/pages/admin/tutoriales/categorias/index@_@astro":"chunks/index_GK9ck7Oy.mjs","\u0000virtual:astro:page:src/pages/admin/tutoriales/subcategorias/index@_@astro":"chunks/index_z9tBQG9e.mjs","\u0000virtual:astro:page:src/pages/admin/tutoriales/index@_@astro":"chunks/index_N8c_Ux4B.mjs","\u0000virtual:astro:page:src/pages/admin/index@_@astro":"chunks/index_COwlUfVV.mjs","\u0000virtual:astro:page:src/pages/api/admin/categorias/[id]@_@ts":"chunks/_id__-uy8aJFE.mjs","\u0000virtual:astro:page:src/pages/api/admin/categorias@_@ts":"chunks/categorias_K7P7bcQ8.mjs","\u0000virtual:astro:page:src/pages/api/admin/productos/[id]@_@ts":"chunks/_id__BrYHqUdj.mjs","\u0000virtual:astro:page:src/pages/api/admin/productos/index@_@ts":"chunks/index_DXj7-EeI.mjs","\u0000virtual:astro:page:src/pages/api/admin/proyectos/[id]@_@ts":"chunks/_id__BPwsqa9O.mjs","\u0000virtual:astro:page:src/pages/api/admin/proyectos@_@ts":"chunks/proyectos_SwmvYppo.mjs","\u0000virtual:astro:page:src/pages/api/admin/reclamaciones/[id]@_@ts":"chunks/_id__CY_99Hsc.mjs","\u0000virtual:astro:page:src/pages/api/admin/servicios/[id]@_@ts":"chunks/_id__D8G91dgj.mjs","\u0000virtual:astro:page:src/pages/api/admin/servicios@_@ts":"chunks/servicios_CLiZgrZQ.mjs","\u0000virtual:astro:page:src/pages/api/admin/subcategorias/[id]@_@ts":"chunks/_id__B-OkSpeE.mjs","\u0000virtual:astro:page:src/pages/api/admin/subcategorias/index@_@ts":"chunks/index_B0Ih_jg-.mjs","\u0000virtual:astro:page:src/pages/api/admin/suscriptores/exportar@_@ts":"chunks/exportar_D2-caw2V.mjs","\u0000virtual:astro:page:src/pages/api/admin/tutorial-categorias/[id]@_@ts":"chunks/_id__3SjHc-u6.mjs","\u0000virtual:astro:page:src/pages/api/admin/tutorial-categorias@_@ts":"chunks/tutorial-categorias_CkKYahEj.mjs","\u0000virtual:astro:page:src/pages/api/admin/tutorial-subcategorias/[id]@_@ts":"chunks/_id__Btt5w-Pd.mjs","\u0000virtual:astro:page:src/pages/api/admin/tutorial-subcategorias@_@ts":"chunks/tutorial-subcategorias_CGB7C_bj.mjs","\u0000virtual:astro:page:src/pages/api/reclamaciones@_@ts":"chunks/reclamaciones_BrMHn1YC.mjs","\u0000virtual:astro:page:src/pages/api/suscribir@_@ts":"chunks/suscribir_tzsraayZ.mjs","\u0000virtual:astro:page:src/pages/api/tutorials/[id]@_@ts":"chunks/_id__3GJI9s7o.mjs","\u0000virtual:astro:page:src/pages/api/tutorials/index@_@ts":"chunks/index_DMvkBZbP.mjs","\u0000virtual:astro:page:src/pages/buscar@_@astro":"chunks/buscar_D6TAwKRf.mjs","\u0000virtual:astro:page:src/pages/categorias/actuadores/modulacion-electronica@_@astro":"chunks/modulacion-electronica_COh4rvUC.mjs","\u0000virtual:astro:page:src/pages/categorias/[categorySlug]@_@astro":"chunks/_categorySlug__BNgExR2T.mjs","\u0000virtual:astro:page:src/pages/contacto@_@astro":"chunks/contacto_CopTzmTY.mjs","\u0000virtual:astro:page:src/pages/libro-reclamaciones@_@astro":"chunks/libro-reclamaciones_xbUezLye.mjs","\u0000virtual:astro:page:src/pages/nosotros@_@astro":"chunks/nosotros_sybeHtbb.mjs","\u0000virtual:astro:page:src/pages/productos/[slug]@_@astro":"chunks/_slug__NV4zL29n.mjs","\u0000virtual:astro:page:src/pages/productos/index@_@astro":"chunks/index_PwDphrCX.mjs","\u0000virtual:astro:page:src/pages/proyectos/[id]@_@astro":"chunks/_id__Cfn_Tspx.mjs","\u0000virtual:astro:page:src/pages/proyectos@_@astro":"chunks/proyectos_CA4E60Vs.mjs","\u0000virtual:astro:page:src/pages/servicios@_@astro":"chunks/servicios_Dt5ktQ-b.mjs","\u0000virtual:astro:page:src/pages/tutoriales/categoria/[categoria]@_@astro":"chunks/_categoria__BJNEgopQ.mjs","\u0000virtual:astro:page:src/pages/tutoriales/[id]@_@astro":"chunks/_id__D-7pAgNz.mjs","\u0000virtual:astro:page:src/pages/tutoriales/index@_@astro":"chunks/index_CE0k7DI1.mjs","\u0000virtual:astro:page:src/pages/index@_@astro":"chunks/index_CMqmBFzT.mjs","D:/Proyectos/heatperu/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_DcxvkocL.mjs","@astrojs/react/client.js":"_astro/client.Cq54w6aN.js","D:/Proyectos/heatperu/src/components/Footer.astro?astro&type=script&index=0&lang.ts":"_astro/Footer.astro_astro_type_script_index_0_lang.Bq7pBPyX.js","D:/Proyectos/heatperu/src/components/Header.tsx":"_astro/Header.XkTdinZL.js","D:/Proyectos/heatperu/src/components/Slider.tsx":"_astro/Slider.Bl6C2ePh.js","D:/Proyectos/heatperu/src/components/admin/CategoryVisitsChart":"_astro/CategoryVisitsChart.B8-PDNhj.js","D:/Proyectos/heatperu/src/components/admin/ComplaintActions.tsx":"_astro/ComplaintActions.CQ5PD-QD.js","D:/Proyectos/heatperu/src/components/admin/CreateCategoryModal.tsx":"_astro/CreateCategoryModal.DFeh5jo_.js","D:/Proyectos/heatperu/src/components/admin/CreateProductModal.tsx":"_astro/CreateProductModal._EqDXuhz.js","D:/Proyectos/heatperu/src/components/admin/CreateProjectModal.tsx":"_astro/CreateProjectModal.DIxgvfbb.js","D:/Proyectos/heatperu/src/components/admin/CreateServiceModal.tsx":"_astro/CreateServiceModal.BQCDJAxl.js","D:/Proyectos/heatperu/src/components/admin/CreateSubcategoryModal.tsx":"_astro/CreateSubcategoryModal.K9OBBPpT.js","D:/Proyectos/heatperu/src/components/admin/CreateTutorialCategoryModal.tsx":"_astro/CreateTutorialCategoryModal.DNkb4W-k.js","D:/Proyectos/heatperu/src/components/admin/CreateTutorialModal.tsx":"_astro/CreateTutorialModal.C9-ECgky.js","D:/Proyectos/heatperu/src/components/admin/CreateTutorialSubcategoryModal.tsx":"_astro/CreateTutorialSubcategoryModal.9jF6voqE.js","D:/Proyectos/heatperu/src/components/admin/DeleteCategoryButton.tsx":"_astro/DeleteCategoryButton.DmOwG0y7.js","D:/Proyectos/heatperu/src/components/admin/DeleteProductButton.tsx":"_astro/DeleteProductButton.em-zOCY1.js","D:/Proyectos/heatperu/src/components/admin/DeleteProjectButton.tsx":"_astro/DeleteProjectButton.Bqy2rsK_.js","D:/Proyectos/heatperu/src/components/admin/DeleteServiceButton.tsx":"_astro/DeleteServiceButton.CGlkr860.js","D:/Proyectos/heatperu/src/components/admin/DeleteSubcategoryButton.tsx":"_astro/DeleteSubcategoryButton.DbWvNTQs.js","D:/Proyectos/heatperu/src/components/admin/DeleteTutorialButton.tsx":"_astro/DeleteTutorialButton.CbXyiYrx.js","D:/Proyectos/heatperu/src/components/admin/DeleteTutorialCategoryButton.tsx":"_astro/DeleteTutorialCategoryButton.DaRGQrm7.js","D:/Proyectos/heatperu/src/components/admin/DeleteTutorialSubcategoryButton.tsx":"_astro/DeleteTutorialSubcategoryButton.C90H9t2z.js","D:/Proyectos/heatperu/src/components/admin/EditCategoryModal.tsx":"_astro/EditCategoryModal.DrlPBeGQ.js","D:/Proyectos/heatperu/src/components/admin/CategoryForm.tsx":"_astro/CategoryForm.CDlzzWjt.js","D:/Proyectos/heatperu/src/components/admin/EditProductModal.tsx":"_astro/EditProductModal.DpjOKtQJ.js","D:/Proyectos/heatperu/src/components/admin/EditProjectModal.tsx":"_astro/EditProjectModal.BDbr_NT9.js","D:/Proyectos/heatperu/src/components/admin/EditServiceModal.tsx":"_astro/EditServiceModal.zTgl4DcJ.js","D:/Proyectos/heatperu/src/components/admin/EditSubcategoryModal.tsx":"_astro/EditSubcategoryModal.lYsWMe6I.js","D:/Proyectos/heatperu/src/components/admin/EditTutorialModal.tsx":"_astro/EditTutorialModal.BXU9sNBj.js","D:/Proyectos/heatperu/src/components/admin/ToasterSetup.tsx":"_astro/ToasterSetup.IJmoRzTb.js","D:/Proyectos/heatperu/src/pages/libro-reclamaciones.astro?astro&type=script&index=0&lang.ts":"_astro/libro-reclamaciones.astro_astro_type_script_index_0_lang.MK0_mBsG.js","D:/Proyectos/heatperu/src/pages/nosotros.astro?astro&type=script&index=0&lang.ts":"_astro/nosotros.astro_astro_type_script_index_0_lang.BR8RDNVf.js","D:/Proyectos/heatperu/src/pages/productos/[slug].astro?astro&type=script&index=0&lang.ts":"_astro/_slug_.astro_astro_type_script_index_0_lang.CVMOzgjq.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["D:/Proyectos/heatperu/src/components/Footer.astro?astro&type=script&index=0&lang.ts","const d=document.getElementById(\"newsletterForm\"),a=document.getElementById(\"newsletterEmail\"),i=document.getElementById(\"newsletterBtn\"),o=document.getElementById(\"newsletterIcon\"),r=document.getElementById(\"newsletterLoader\"),e=document.getElementById(\"newsletterMsg\");d&&d.addEventListener(\"submit\",async l=>{l.preventDefault();const s=a.value;if(s){o.classList.add(\"hidden\"),r.classList.remove(\"hidden\"),i.disabled=!0,e.classList.add(\"hidden\"),e.className=\"text-sm mt-2 hidden\";try{const t=await fetch(\"/api/suscribir\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify({email:s})}),n=await t.json();e.classList.remove(\"hidden\"),t.ok?(e.textContent=n.message,e.classList.add(\"text-green-400\"),a.value=\"\"):(e.textContent=n.message||\"Error al suscribirse\",e.classList.add(\"text-red-400\"))}catch{e.classList.remove(\"hidden\"),e.textContent=\"Error de red. Intenta nuevamente.\",e.classList.add(\"text-red-400\")}finally{o.classList.remove(\"hidden\"),r.classList.add(\"hidden\"),i.disabled=!1,setTimeout(()=>{e.classList.add(\"hidden\")},5e3)}}});"],["D:/Proyectos/heatperu/src/pages/libro-reclamaciones.astro?astro&type=script&index=0&lang.ts","const t=document.getElementById(\"complaintForm\"),d=document.getElementById(\"submitBtn\"),s=document.getElementById(\"submitText\"),n=document.getElementById(\"submitIcon\"),i=document.getElementById(\"successMessage\"),e=document.getElementById(\"errorMessage\");t&&t.addEventListener(\"submit\",async a=>{a.preventDefault(),d.disabled=!0,s&&(s.textContent=\"Enviando...\"),n&&n.classList.add(\"hidden\"),i&&i.classList.add(\"hidden\"),e&&e.classList.add(\"hidden\");const c=new FormData(t),r=Object.fromEntries(c.entries());try{(await fetch(\"/api/reclamaciones\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify(r)})).ok?(i&&i.classList.remove(\"hidden\"),t.reset()):e&&e.classList.remove(\"hidden\")}catch(o){console.error(o),e&&e.classList.remove(\"hidden\")}finally{d.disabled=!1,s&&(s.textContent=\"Enviar Reclamo / Queja\"),n&&n.classList.remove(\"hidden\")}});"],["D:/Proyectos/heatperu/src/pages/nosotros.astro?astro&type=script&index=0&lang.ts","const e=document.getElementById(\"exp-counter\");if(e){const a=t=>t*(2-t),r=new IntersectionObserver(t=>{if(t[0].isIntersecting){let n=0;const o=s=>{n===0&&(n=s);const i=Math.min((s-n)/1500,1),c=Math.round(a(i)*9)+1;e.innerText=c.toString(),i<1?requestAnimationFrame(o):e.innerText=\"10\"};requestAnimationFrame(o),r.disconnect()}});r.observe(e)}"],["D:/Proyectos/heatperu/src/pages/productos/[slug].astro?astro&type=script&index=0&lang.ts","document.addEventListener(\"DOMContentLoaded\",()=>{const n=document.getElementById(\"slider-container\"),c=document.querySelectorAll(\".slide-item\"),a=document.querySelectorAll(\".slider-dot\"),u=document.getElementById(\"slider-prev\"),f=document.getElementById(\"slider-next\"),i=document.querySelector(\".slider-wrapper\");if(!n||c.length===0)return;let l=0;const r=c.length;let o,m;function d(e){if(!n||e<0||e>=r)return;const t=n.clientWidth;n.scrollTo({left:t*e,behavior:\"smooth\"}),v(e)}function v(e){l=e,a.forEach((t,p)=>{p===e?(t.classList.remove(\"bg-slate-300\",\"w-2\"),t.classList.add(\"bg-[#f04f23]\",\"w-6\")):(t.classList.remove(\"bg-[#f04f23]\",\"w-6\"),t.classList.add(\"bg-slate-300\",\"w-2\"))})}function L(){s(),r>1&&(o=setInterval(()=>{let e=l+1;e>=r&&(e=0),d(e)},4e3))}function s(){o&&clearInterval(o)}a.forEach(e=>{e.addEventListener(\"click\",()=>{const t=parseInt(e.getAttribute(\"data-index\")||\"0\",10);d(t),s()})}),u&&f&&(u.addEventListener(\"click\",()=>{let e=l-1;e<0&&(e=r-1),d(e),s()}),f.addEventListener(\"click\",()=>{let e=l+1;e>=r&&(e=0),d(e),s()})),i&&(i.addEventListener(\"mouseenter\",s),i.addEventListener(\"mouseleave\",L),i.addEventListener(\"touchstart\",s,{passive:!0})),n.addEventListener(\"scroll\",()=>{clearTimeout(m),m=setTimeout(()=>{const e=n.clientWidth,t=Math.round(n.scrollLeft/e);t!==l&&v(t)},50)}),L()});"]],"assets":["/bc-nosotros.png","/bc-proyectos.jpeg","/bc-servicios.jpeg","/logoheat.png","/nosotros.jpeg","/slide_baite.webp","/slide_becket.webp","/slide_belgas.webp","/slide_honeywell.webp","/slide_mcdonnell.webp","/slide_pf.webp","/slide_suntec.webp","/slide_vmv.webp","/slide_wayne.webp","/clientes/alya.png","/clientes/backus.png","/clientes/calderas.png","/clientes/calidda.png","/clientes/cosapi.png","/clientes/danper.png","/clientes/heineken.png","/clientes/hialpesa.png","/clientes/ingevap.png","/clientes/newmont.png","/clientes/omat.png","/clientes/siderperu.png","/clientes/tecavi.png","/marcas/allanson.png","/marcas/baite.png","/marcas/beckett.png","/marcas/belgas.png","/marcas/everlasting.png","/marcas/gems.png","/marcas/honeywell.png","/marcas/mcdonnell.png","/marcas/mth.png","/marcas/powerflame.png","/marcas/resideo.png","/marcas/siemens.png","/marcas/suntec.png","/marcas/topog.png","/marcas/united.png","/marcas/wayne.png","/productos/bc-productos.webp","/_astro/CategoryForm.CDlzzWjt.js","/_astro/CategoryVisitsChart.B8-PDNhj.js","/_astro/client.Cq54w6aN.js","/_astro/ComplaintActions.CQ5PD-QD.js","/_astro/CreateCategoryModal.DFeh5jo_.js","/_astro/CreateProductModal._EqDXuhz.js","/_astro/CreateProjectModal.DIxgvfbb.js","/_astro/CreateServiceModal.BQCDJAxl.js","/_astro/CreateSubcategoryModal.K9OBBPpT.js","/_astro/CreateTutorialCategoryModal.DNkb4W-k.js","/_astro/CreateTutorialModal.C9-ECgky.js","/_astro/CreateTutorialSubcategoryModal.9jF6voqE.js","/_astro/DeleteCategoryButton.DmOwG0y7.js","/_astro/DeleteProductButton.em-zOCY1.js","/_astro/DeleteProjectButton.Bqy2rsK_.js","/_astro/DeleteServiceButton.CGlkr860.js","/_astro/DeleteSubcategoryButton.DbWvNTQs.js","/_astro/DeleteTutorialButton.CbXyiYrx.js","/_astro/DeleteTutorialCategoryButton.DaRGQrm7.js","/_astro/DeleteTutorialSubcategoryButton.C90H9t2z.js","/_astro/EditCategoryModal.DrlPBeGQ.js","/_astro/EditProductModal.DpjOKtQJ.js","/_astro/EditProjectModal.BDbr_NT9.js","/_astro/EditServiceModal.zTgl4DcJ.js","/_astro/EditSubcategoryModal.lYsWMe6I.js","/_astro/EditTutorialModal.BXU9sNBj.js","/_astro/Header.XkTdinZL.js","/_astro/index.BPkQ8rv5.js","/_astro/index.CBNDYNWH.js","/_astro/index.CJ7Pa_h0.js","/_astro/index.DgA-ds1t.js","/_astro/index.DRNCQIzx.js","/_astro/index.t7x-dYDo.css","/_astro/jsx-runtime.u17CrQMm.js","/_astro/ProductForm.BYx1p0ES.js","/_astro/ProjectForm.D6xrtZEc.js","/_astro/ServiceForm.Dwot_OCc.js","/_astro/Slider.Bl6C2ePh.js","/_astro/SubcategoryForm.CvVj9MWF.js","/_astro/ToasterSetup.IJmoRzTb.js","/_astro/TutorialForm.BdTjkcqA.js","/uploads/1758317159d06adf1f0368e505863bcb168cf66e68.png","/uploads/1758317193496f4a560c4d332c729b66c0866298aa.png","/uploads/175831726998eee60cd47b7b313094e893596b3bd5.png","/uploads/1758317320139a08affef105503d2dfdba87116834.png","/uploads/175831747552354ce35df9cc52260508d4d1cc886c.png","/uploads/17583176191b5312e1f68fd9acb232a09bbafa50c6.jpg","/uploads/175838672701dd9b048e908fa9b992f1d9b1952463.png","/uploads/1758386795dad8bd844b7e96adfa3b44a871a281b8.png","/uploads/17583868433c7546cedd2c8b0e12a22f350c11eb2c.jpg","/uploads/1758386869f55dffc1d8b516ca30fa1e3690da9cb3.png","/uploads/1758386938dfd2aa3938c2f93a330ef76a49648a28.jpg","/uploads/1758386966afbabb1d9088ce234fa34fbb0df77b2b.jpg","/uploads/175838699382071a1ce4f2dde44f242668e5f00c40.png","/uploads/17583870171e0be6ecdf943d41ac99d276cc382e5e.png","/uploads/1758387059fec6f3618cf5b86b54c4071277bbaf22.png","/uploads/1758387089708316d4c0c011d893eb639696eacd4c.png","/uploads/17583871221f33ef6d6d63e068da91cf33dfaf8b58.png","/uploads/17583871578a315a6f03a1a1f2eedefc2799a60db9.png","/uploads/175838722300db4ae2194b00b116fcca7cac99e128.png","/uploads/1758387325ed018067344aabd873ac7eb598a4aea6.png","/uploads/175838736504353d5e2b074564dc4eb5a392fcbcfa.png","/uploads/17583873932e78a8382f2b60b40c3dbe92ad766cc8.png","/uploads/1758387437c561436544b8da7829597aa115419acc.png","/uploads/175838747023dbd62c9896f50217a030bb7ddd9408.png","/uploads/17583875090f95ec44d58cb1c13b140a1c13db6e8e.png","/uploads/17583875343dcb7cbf5faab4c7fee490aeb89a1dbd.png","/uploads/17583877600f871c86ab4de39005544280236f111d.png","/uploads/1758387831ec451c766d7beca4096f898e83f9bf5b.png","/uploads/175838788123a20ff45e04be06e19caa0d69c6692a.png","/uploads/17583879197d572181c1c2be3f88119c43afe0538c.jpg","/uploads/1758387955f6d8f816fa6b1b3473e7eb3767d93ec5.jpg","/uploads/1758387980e5a9ccc836fdeea4264db835b4ecd961.jpg","/uploads/17583880295c5b9d618c89302190ebbfdb68bea7ce.jpg","/uploads/175838805733cc8767767eaa185ad5dfee18829460.jpg","/uploads/1758388080a6e5e3cda2f7be5cddc267c7f9d3139c.jpg","/uploads/17583881020100fae9c2cf4cdc01d5339df790c3c3.png","/uploads/1758388128ddd11982f155cfbe46ef213f12b02f73.jpg","/uploads/1758388153fc99b433c86b460a4c161b11cb493c5c.jpg","/uploads/175838817801515b697eeea4b2a034d552cef027ad.jpg","/uploads/17583882583e220008fbd677adf7adf8fb6128036a.jpg","/uploads/1758388286a85f0002d268a452e9ff314a495f3bf4.jpg","/uploads/1758388343a0f6c445941bbe36872fa0aae890ebd4.jpg","/uploads/17583883779f33b8ed0f355d433cfbfa9267316702.jpg","/uploads/1758388406ba7887921ff5cb8dddc12a3153e0cff4.jpg","/uploads/175838843952ae9a09b349d104ae7ce183da41d113.jpg","/uploads/175838846660ba66c71ddeeb2b9727b23d1447a8ef.jpg","/uploads/1758388494a530d65c0c8a4d0ba52fee5105e219ef.jpg","/uploads/17583885184e399e177c9897427830f0fc30c555e3.jpg","/uploads/1758388544bd408e5d6f9f9835db1ebdda0074fe56.jpg","/uploads/175839320342b6208a5bcc8aca7d1374faa65c58c8.png","/uploads/1758393301a89e2c547db419ea88f040534a58d3c9.jpg","/uploads/17583933270c476ac526cddc6ef691eb8d2d82ccb3.jpg","/uploads/175839410562220f93116d3cbbfe1433da8acde639.jpg","/uploads/17583941329662452e1b9de36a2b3d3f4ac5c7dfd4.jpg","/uploads/1758394156cf3de3406643648d96e793a3842ba3c0.jpg","/uploads/1758394180095d1ccf6140fe1b5db45432d6e9c21e.jpg","/uploads/1758394218fba962bee05da51466d5cea898364c2a.jpg","/uploads/1758394259aa28b8a7c1e7b0ce0e3b1fa2804d62c7.jpg","/uploads/1758394293810788db9ab64b4dfb6b9e435cda3877.jpg","/uploads/175839438159bd1fe72f63cb3382a3e1a04aa5c09f.jpg","/uploads/17583944101972215b0ac8728bb077a43796161c9e.jpg","/uploads/1758394682022fbee2cb413e4ecc0270dc7e41031a.jpg","/uploads/17583947155dfd14bbfc9056e67633f7879de99ccc.png","/uploads/1758394742e41da80572bded0a42582d6a559f5939.png","/uploads/17583947699f2c792964f9eafd2901fd76906607ea.png","/uploads/175839479886474da12cbde483b89beb166b100f24.png","/uploads/1758394825703430286756f792b977a21fd12b3a0f.png","/uploads/1758394853cfab122846b5c50cd181237ce7fe8c54.png","/uploads/17583949660ec08dda76f1a752c8cfe73a43bcf3b6.png","/uploads/17583949919444494c52b4465298ac3a4613696677.png","/uploads/1758395018fb4733ad3432360c1c8a8fbced693aba.png","/uploads/1758395043f55252dfd4703e983f2bd71226efc23e.png","/uploads/1758395070c6f98a299cb53190f802b126b4abc6cc.jpg","/uploads/175839509608df218ec8b2cdb5ab709cb36622a701.png","/uploads/1758395129acb21ef2bf2a8b877088d094664b5398.png","/uploads/175839515393dc54e1cf183efaef11b482fae45d49.png","/uploads/17583953482cb29a5e1c0bf735f23b4625a97479c0.png","/uploads/1758395375322c095a65dc154937c06660b9d106f0.jpg","/uploads/17584014554feee65f516a4fc15561dcd9b26a1067.jpg","/uploads/175840149593fc6aef96b2f5d9e16dfa2d4ef96091.png","/uploads/17584015213f835088cb1151b285381a0cd6f13dbf.png","/uploads/175840154918d9015d28432c91345c012006ad221f.png","/uploads/1758401576ad0ac7b0f9adfcb7aca04a12ecb39e90.png","/uploads/1758401604605e87e7b471c8c5d3dc36c27019cbd1.png","/uploads/175840163144c1acb53e4694442235bcc9c28b1777.png","/uploads/1758401660a6dc9af3637c202b5482fcd958dcb9d6.png","/uploads/1758401690d7b8b6608b3204ce05b1ed36a7b011e0.png","/uploads/1758401726ff60c32480921bd170ea20b767a969a3.png","/uploads/17584017581ee15e664f496fc780d777f09ee5f892.png","/uploads/17584017939016d8cab40499baa07619a3854e7381.png","/uploads/175840283858747f31e6b7e0b02e2d73edd5b88174.png","/uploads/1758402890d02aed101c0c90d018995a8033738b88.png","/uploads/1758402923617a0021763d4c31640b2f8ccfcc2606.png","/uploads/17584029491edab6f5edab0af4f0d93ae7ab83c2e0.png","/uploads/17584029753bc8389d688dcfe45b187576b8169c92.png","/uploads/1758403002dfe2ce2d6ecb0cf4f13f9c534d0769f1.png","/uploads/1758403026c70bb01045e4297ebb4bbaa862eeb24a.jpg","/uploads/1758403051e3de8eb40956ad7402ca2593fbfcdae7.png","/uploads/17584031193590ce4409c1521e41d8b241f0d4c242.webp","/uploads/1758403170d0489c745f8bde622cfed2d9c5f3d64c.png","/uploads/1758407304bb213ebec4b8e87b2f6b2d4177c47953.jpg","/uploads/1758407345aed9d33a6f5702a78e4691150adeba70.png","/uploads/17584073732e0311e4502ce336a9896ecdd0aaaf1e.png","/uploads/17584074042186ba59bc1523d1868000d675cbe3f1.png","/uploads/175840743161c0361748c0ff02731dbd843da80f8a.png","/uploads/17584074844101e4982517b776ae8a5b21296fbe21.png","/uploads/175840753505222defda85b0be5d60096fb7d954d1.png","/uploads/1758407560c40df56f5e25d0c7fb5460082ff29653.png","/uploads/1758407636f90cfd6cdf56bc1df91cb48cf462b631.png","/uploads/1758407661e831d14b4869ca7faf42d36f9f7a6d86.png","/uploads/175840768354915b9169819a91af6a2ed54c2a6f7c.png","/uploads/1758407713228df299a6cef5358b3aeb1bdade2958.png","/uploads/1758407740d625a9d199d0dde8bda2de8d333d87f9.png","/uploads/1758407766d206bc48df600730bbd8a5e41b755b6e.png","/uploads/1758407789fe06a07bd1de49dd7b49f648a6a28333.png","/uploads/1758407813fc55283a466393a58e68985a0f911420.png","/uploads/1758407837efb8df5373a3b3ecf05d3ce45c1f82dc.jpg","/uploads/175840786584059dbef5930e58711dd2c7940ed02d.png","/uploads/1758407887670932a64a970778c65b4af4deefca75.jpg","/uploads/17584079163ef3d1cc3f29029631b5bf1a51549cb4.png","/uploads/1758408037151939558e90fc8b82639eb640efa969.png","/uploads/1758408068b4cfe986c50d7b715e63d6c0df8d9b95.png","/uploads/1758408095ca1fb1dc32efbed2797fb6c97cb9c5e0.png","/uploads/17584081219952e95555aae60473e256827ae4eac6.jpg","/uploads/1758408149b938bae2d6f9d09d8afe508e8b63942d.png","/uploads/175840817649eb8887de75b3d6bd0408057b21c420.png","/uploads/1758408200c6d28217814585e2151dff8b26e7df18.jpg","/uploads/1758408227aa094e6569bbeb25e3a531876d9db0e2.png","/uploads/17584082515def4214fa2005094e6aac60a925f739.png","/uploads/17584084248c5aac6a34afdec32dbeb54c67b3744e.png","/uploads/175840845603e3aec5382df48bb9a36410ac149d3c.png","/uploads/17584087498bc783302aee5b9f42675870ccd2c0cc.webp","/uploads/175840878326bcf77ceaff9c1ca43f8024e41803ca.png","/uploads/17584088230035a39ae0a97c7d02dd1048145ebdc8.png","/uploads/175840884785f98f7213730caea78bd7028511197f.png","/uploads/175840976095194c9f5421ec32ae1696b617155eca.png","/uploads/1758409860fc496599c2fd2aee70e6fd181ce84727.png","/uploads/175840988806ce22b30012b92cb8b710eac9b28a2f.png","/uploads/17584099466c31e05ba875e7a220730c8b79619741.png","/uploads/1758410714034ab231f698a8c23aecc8803213f095.png","/uploads/1758410814a38fb8284765de0630636db3095072bd.png","/uploads/1758410866ac82234fff7f5d7c24e25268d3ebf6c7.png","/uploads/1758410919f2441868834b7a764f9f659c14088343.png","/uploads/17584110159d93fff17505f3fb7adba2bedafb1bf8.png","/uploads/17584110666619912140bcc5ef4325f79d54ec860c.jpg","/uploads/17584110994d7f2b190262f42e616778ff8a0e57ec.png","/uploads/1758411240dc28b9a2a810677c09ebfb535100fc89.png","/uploads/1758411313985b88e3ab7bb7485ad760525e3c0195.png","/uploads/1758411358b3413ddac0375f42f4e93e181359fc38.png","/uploads/1758411576b760cbe0853993972b6fc43de7f53fbf.jpeg","/uploads/175841188639f892f98624b1c130b4baa054753cf0.jpg","/uploads/175841345730c1069f2175c6d72c9e2df23457cc06.png","/uploads/1758416258b26d3535926e0ff797c5510669c11192.jpg","/uploads/175841629644f3eff58e66f7706dcbedf0dcf844b7.png","/uploads/1758416321c0296cee8dc8da7f63ec5a4c08adbc89.png","/uploads/175841634434b1536d0de039320c3fb87c088525ae.png","/uploads/1758416371ec9f4444dfed94a5fb92c33d8804de1d.png","/uploads/17584164003952e5ccc06340f9372790782cacfc49.png","/uploads/175841646862368729a8cfdead71aa085ca17d0f1e.png","/uploads/1758416494ee885bba3f6c59c41259e6ae4452ece1.png","/uploads/1758416518d6bdb3d42528689312bb8fed9d17bce8.png","/uploads/17584165440fad1f80194b82839d08a75c32d89f09.png","/uploads/175841657008df8459c28ddc5feb6f53d4ac3e6495.png","/uploads/17584165964a763f2fb85b6e721f1237af473c5804.png","/uploads/1758416628b0b4f4a39ebb3732dc5c9180fd803ea8.png","/uploads/1758416699bf3a1caaf8c0b01f0a46e68d21a8ea35.png","/uploads/175841680938c09c89a64e92397c7cf8b617ba1765.jpg","/uploads/175841683997c6c1e4b6bd312bc5ca00087205eddf.jpg","/uploads/1758416912b5e1a20e8aa7773a73a4dc2a07a62414.jpg","/uploads/1758416936cbdbcc9c9058091decf5a0a4c0a78fab.jpg","/uploads/17584169590adaa2f15f08ba53cee43d007d25f0c6.jpg","/uploads/1758416980720b13ac492e8b2031d87cb57c17f20c.jpg","/uploads/175841700364acb1de618c685fade1275e1ad96942.jpg","/uploads/175841702831f1abdb84c35b820c51d95462c89ff1.png","/uploads/1758417053cd45a3d4e928f544a26dfa8b57e0248e.png","/uploads/1758417076a51f85b747727f9d1eac7650cbc797da.png","/uploads/17584327961e7e82c0cf9019c7227b4b494519d92c.png","/uploads/17584337458c32dcce3db05703c1c28504af1eed09.png","/uploads/1758433777640ce577b70533009274191175367c7a.jpg","/uploads/17584338058866fa1c7db0fa5c66e31d6faa6b11c9.jpg","/uploads/1758433830343f525cf64b31347d6f87a3ac961c70.jpg","/uploads/17584338632433c57122b57bb53b22eb376715a579.jpg","/uploads/1758433890dbd00bbb4aa3affccd29636c6205c5fd.jpg","/uploads/1758433918f15f632f0d97f72c23a5176423bcb55a.jpg","/uploads/17584339443570555f5eba01ede6754a0ec1e2e789.jpg","/uploads/17584339669d7806671aec901c10781b1dd78c1e38.jpg","/uploads/175843399410194c2427cf59d90e7b73967d17f2c0.png","/uploads/17584340231675198d70f755ebffb07b0301ca2a22.png","/uploads/17584340486300a3a70aed5f56c7e413b249c690c9.png","/uploads/1758434075edbf470547ae5f6319a0b436dfbb55ce.png","/uploads/1758434100bb220a249fc600163be8d891e94edcf8.png","/uploads/175843417110856eab2e3a6354bd03ff49bd6b7956.png","/uploads/1758434205d53b863617273f8f496ffead5bdbebe2.png","/uploads/17584342861860cb5dcd8aa5e9bf5591c8386fe931.png","/uploads/17584343174aea0ce75a30448ebe8908a574cf0573.png","/uploads/17584343421e64c95e5eb6b6485471625892f276dd.png","/uploads/175843437220be7ee88fcbe50face4d32a01434cb8.png","/uploads/1758434404ca2316a8c67c3984b0ac05847ad4e9f0.jpg","/uploads/17584344262e8251389f259ff599687b6cf1d65f48.png","/uploads/1758434446fce8010587f20daca100829ea7805b11.jpg","/uploads/1758434468403d0c79fcc95c96e3658ada724a29c7.jpg","/uploads/17584344910d89d6bf5f30904592a9bc37d1035c03.png","/uploads/175843451149d60d38b16144a6c833f651dee8b964.png","/uploads/1758434533966ecaf54f01a6ae895b02db1c13d4fd.png","/uploads/175843455932fb4dd1ab3864ef38eb70711d5d0d05.png","/uploads/17584345867d95fdee79842953296555cbbb03492f.png","/uploads/1758434610389c70d11258245fd33556ad48ac55cb.png","/uploads/1758434856cd1aa3b8b070cbd5f894e119a83f62d7.png","/uploads/1758434883725aa8b4ed3b0c6df6ba930c76160233.png","/uploads/1758434945d41cbf71a216bd08c79b049c3900dad8.png","/uploads/1758434975cf810baadf91ab4cf1dba80517528cd3.png","/uploads/1758435006e34f1f24f016d02b40b4acec49213fde.png","/uploads/1758435169fe8b14b0f3b090e070a97ab923513e00.png","/uploads/1758435196b361034e483f3e2069707c52a9ba3131.jpg","/uploads/17584352225b21049821db8a4370ccd1183ee85071.jpg","/uploads/1758435253e3724345ebe61dacd9e52154d415635e.jpg","/uploads/175843530758c71fc650018e7355cb833fcef362c2.jpg","/uploads/1758435331f5d139680ad7bbffda2c1a9b0d12e159.png","/uploads/1758435356ad953825de9beee84cad5a1047ff1a33.jpg","/uploads/1758435382651de2323007610ee5b9d543c5ac88f3.jpg","/uploads/1758435409974b9b29fde706e4c1fd38422faddc6b.jpg","/uploads/17584354374d0773e27611d8324cb415d8b260eb5a.png","/uploads/17584354821cd762ed3f2e3a579f0aa3f64b1b1442.png","/uploads/1758435507886f3290a0db3c73f61ef4bf34610197.png","/uploads/1758435534a1445c71e9928f5eb4efd03dae226471.jpg","/uploads/1758435558a655d1d7d33f6375c952992351f06806.png","/uploads/1758435584db8a82c1aefcfd5c745db25167e579ac.jpg","/uploads/175843567637b60df46d38807384296dcac478f2fa.jpg","/uploads/175843571290fc014cde2f5f5e1d44537a4702a6e2.png","/uploads/1758435735a8493dfeb4007d8ae9513e945bb1b7ce.jpg","/uploads/175843575807caa208ffa0e878e9e330ad8531f905.png","/uploads/17584358828a08c2c98cd92ed4f1d1ae1bd67283a0.png","/uploads/175843591028a3b6248c01725ea9d03173feeadb4d.png","/uploads/1758435936bef5154da2c5668293fdd8a105a11f84.png","/uploads/175843599199f0fc35a34613fedbeec4ad9a1f2a40.png","/uploads/175843602519eadd1e4fd35c7c68dbd2d7dfa0d9af.png","/uploads/1758436058914189b1260403aea12a09802e71f2a7.png","/uploads/1758436086880cd015ef61e8144c005a401d572011.png","/uploads/17584361140121ca385b97be0317dd991ad89d8cca.png","/uploads/1758436158c35edfe9f03f179cd3515f705412c055.png","/uploads/1758437308aa63241309c002d0e7e1e6d387aced93.png","/uploads/17584373374c87d27c08699880230b234ecd92f2d1.png","/uploads/1758437369c58bc22a475915f14da3441aa4795d80.png","/uploads/1758437519241915f37350a55ccd247ef7d5877cb5.png","/uploads/175843756028b91e9a162e9f62a4c8c383c9a931c2.png","/uploads/1758437587be4e892f04575968fffe2b16f88ac4f6.png","/uploads/175843761565b1e5a07efc38f3bf32a15816b8eefe.png","/uploads/1758437642fa49a918c2e4e2c057fbc2e203537bd2.png","/uploads/1758437670e8694942baa70fb189cea6dac4356ac0.png","/uploads/1758437697b7e33fc5c24e1da25e259d0a09be5515.jpg","/uploads/1758437724a842e02a5044bc965e302803d7a229e3.png","/uploads/175843775537a33b3209aafaecc2f5b154b034e351.png","/uploads/175843778412cf4c3d4bd1cdc4bef2b66b127ca097.jpg","/uploads/17584378149c817ccdefb3b6c9ac94c27985b4f372.png","/uploads/1758437841e4e8c587107874ac3fc4642cc2e073b4.jpg","/uploads/175843787047db739e8ab8e28e0b2ee79dd54a534c.jpg","/uploads/1758437895c44e230f723b4f4a1a7853ea3f3626b6.jpg","/uploads/175843792218f504a8a1d9af3418118d0971d40f7d.jpg","/uploads/17584379522bf80130b5402562dbe64a20ede47f8e.png","/uploads/17584379780e3afffaec17a065b7c3db970b6d9fb8.png","/uploads/1758438006a082400166e09a8be7e49513328e6aca.jpg","/uploads/1758438048635964954455e34ff2ae77f7100d7b46.webp","/uploads/1758438128ae31f6ab4d25d65dd2055d229e2c3669.png","/uploads/1758438160203523315d2a44816924ada5371cee83.png","/uploads/175843825511a44ae7d1cbd251d79f5d5826a9cd86.png","/uploads/1758438282b7e5c25da3056aa6f8028cbfd8ef15ff.png","/uploads/17584383113cf226a2d00b122608a434ba9eee708f.png","/uploads/1758438338c177efdfb33b7b38e431cd625c45e1e7.jpeg","/uploads/175843836837eabf6d8f5cbf4a2fdbffbc581b14cd.png","/uploads/1758438393d035f31dcc999c6e81850ff2ca785dda.jpg","/uploads/17584384244316e0ec121bc2dcfbf0590e56c53688.png","/uploads/1758438452c7bcc4664f72fbb52fb05f8ffb5626e4.png","/uploads/1758438478b8e2b60a88cebc517c52f22213e77067.png","/uploads/17584385022080d241a70e30620a4dad6113cb3715.png","/uploads/1758438659432f8e6218bd6dabc774442434c014a9.png","/uploads/1758438689e95d775ac3d0b1ffe04abcd38a751e3b.png","/uploads/175843871674a61ba1d91a35357997886a8d47a81e.png","/uploads/1758438742848ede5ce83f205aa2d90f54017770d0.png","/uploads/17584387699fc176f12790c954e8d2c749434d7b75.png","/uploads/1758438793330b52a857f03bdac3e668fa0cb07f83.png","/uploads/1758438818516324a82a6b5c589d4f14c39e6a4954.png","/uploads/17584388513a5b72edec9c61ad6f3a42b0c5fb6f76.png","/uploads/1758438903f1183d20a7429b3d1f6cf60a6af3a29d.png","/uploads/17584389286b665322548f33ee3bc87a9e42e2e133.jpg","/uploads/1758438963baa6f4578f183c17443f928687f6ba5f.png","/uploads/1758438988eb453f9ec0ed121abb61e9c7ed935abe.png","/uploads/17584390145323f80d6a1c17b5e43fd15a7305d075.png","/uploads/17584390455a4a11ab91a3f9f03e62198b63e27185.jpg","/uploads/175843907450293a0b9659ec6d0b6895f247d48c16.jpg","/uploads/17584391169de44b562a286e51015560e0acfee9d1.png","/uploads/1758439149fa9a300982559a950e560aa32bb0d390.png","/uploads/17584391812787baf14bfb69e0d28f1e67b36c4bca.png","/uploads/1758439209d18e30dd3e6181b477f3a541ca0e1c23.png","/uploads/1758439264438b74817a6156526ffa15a0827da46d.png","/uploads/17584392956d631f053ae34c2ee47a03ab4e3fe25e.png","/uploads/17584393370a1aba89b48ac83e3398b02afacaa586.png","/uploads/17584393673154002e732573fcda9049b9dec07191.png","/uploads/17584393961434030b183fd7214412a3739eee703a.png","/uploads/1758439426166b457b8d97700240d91816a760b125.png","/uploads/1758439462ac5f76ab25c3d9d713c6d5b87290b761.png","/uploads/17584396687ef40201f66efab32d0fd2047b6ba803.png","/uploads/1758439700e8a6b6176c5a30442559c9687394d945.png","/uploads/175844180447937c6dd226d802f027cfab7162ca1c.jpg","/uploads/17584418467bf85f518abd8428c9257514d8de0b38.png","/uploads/17584418784b6ef0dfccdf8cfb0cfa4c82afe93350.png","/uploads/17584419110b6259a1f4170856602cda1ab2d01950.png","/uploads/175844194145c9ab85e26d7028cf428fe3c15401ea.png","/uploads/175844197034c2809e9354121f12ee0cf8d47a5ae0.png","/uploads/175844199820c222b03ee88bafd50767e9c3b7f6c7.png","/uploads/1758442026d20927bb85b0e7372fcf6d27f2e5f2bb.png","/uploads/1758442065c85fd0bfe82242973a36a0a74c84ae57.png","/uploads/1758442097bfebb92365d8311e762e31362b1acee5.png","/uploads/1758442125367aec8a74113ba47dd60342c0cb45c6.png","/uploads/1758442158197ebaf57b499455f49fb56d5ce10906.png","/uploads/1758442187e5fbc22dce88d495f3b164925ad566bb.png","/uploads/17584422185e96a692228aa6102efbee6a4587c20b.png","/uploads/1758442249c0d7b55863382fd6ed96ec02a33829ce.png","/uploads/1758442284b830c2bb13c591c164e5ccaad1fb73f7.png","/uploads/1758442315475cc8d5c42a6717cc17418bbdfc4ea9.png","/uploads/1758442363fc242946cbac6c135aba82e99952b9d0.png","/uploads/1758442396f4bb0b6030ddc45622b1a92308339aa5.png","/uploads/1758442457cd1e83540669f28a378c43565020ee46.png","/uploads/1758442488b385a51905f422b2c396f3c199a3b508.png","/uploads/1758442519320ba95c4790c0a9b63d69a4629e574c.png","/uploads/175844255261342cce2c30004db56aeb5a352b8d5d.png","/uploads/175844258820edae8563cacd0c0271ed75840cc3d1.png","/uploads/1758442718c1f7bf231f35f2f06d72b37209c48da9.png","/uploads/175844275098161b31fc24ba40fc308ee9d55a5981.png","/uploads/1758442783488c9fafa4cb2cc83463f5623ab73253.png","/uploads/1758442816aa1a2b27f27d2f9066991e9d5835c09a.png","/uploads/1758442851ae4d7e91ac313bafb38164e7f5f65dcf.png","/uploads/1758442890d7888a60fe9d14a8d2599d767cfd7c1b.png","/uploads/17584429367dd35a9c8d76e6a6668968528c96135b.png","/uploads/17584429923523084e168268112f036f11e4e14447.png","/uploads/17584430401c1c2bc70d3d7038034b007f829b0ea1.jpg","/uploads/1758443075a612d4205a148752d8323de07cca580f.png","/uploads/1758443104f036caac6ae76227dc8ca696db544739.png","/uploads/1758443136a3fbb5c387a6ca38aca12902a279e2a3.png","/uploads/17584431744cb31335184822dfe1c797140881234c.png","/uploads/1758443208e686e0d07bfc1a84e4afaecb93c8785e.png","/uploads/1758443239cec0d82e30593c047968e90b82848f1e.png","/uploads/17584432702d40c46b952096d462cc39d140b2a3bf.png","/uploads/17584432991a26b5ea0346a87bc38a6798ba54de17.png","/uploads/17584433274a0b86d3550ffefc08f63d86a688dc2a.png","/uploads/1758443386ec87f0c53c7843907673490d8ccdea72.png","/uploads/1758443429e7644f88d1c8533b6f6a7579904da741.png","/uploads/1758443465ec14649b62250180a0613484fd690e52.png","/uploads/17584435026ec76b819b3c9965fe9968a4fb0ab735.png","/uploads/17584436260056ceeea2f3261d42bed2b9ac75fdee.png","/uploads/1758443665cacc2cdbe5f48b5fd2b33db6b3bd8e32.png","/uploads/17584436894405cb99a5066c8761493a5aaba27c44.png","/uploads/17584437140f2a1295c9e631332c9a63ed8cd2bd61.png","/uploads/175844373915fbe4a650f4475afb46b91ef8a8435a.jpg","/uploads/1758443758b60dbe6834bcc7efa577a2ffb5102f76.jpg","/uploads/17584437818f41f9f85b8eb08c634109bf858bb981.jpg","/uploads/1758443824841cbcb7ee84cf25511218f2f6e01be7.jpg","/uploads/17584438495e0ae9a455c9d99d8895cae757389b28.png","/uploads/1758443875fda8c8344de79e8a74beb9b4a6ad553b.png","/uploads/175844391175b1f927ad3b8a13417abb5a6cd06136.jpg","/uploads/175844393144bee541479fe5cf49120826dc40c2cf.png","/uploads/175844395179ca70e4147acb23eddb9430481484c6.png","/uploads/1758443973f3a65e2b0034254a9ea781c4755ad4ff.png","/uploads/1758443996db42cf60e6eef8fc256ff903b848c1ed.png","/uploads/1758444019d4e396637c26f6a4dbdb99cd67095347.png","/uploads/17584440679410407929cd8a6e79758ac4e30bcb5b.jpg","/uploads/1758444139236a05fcb363ee2ea865291457decfd0.jpg","/uploads/175844418794ba874c2f13e72190487759ac0abf52.png","/uploads/17584442091408376f41d666d00c053ceb092c80f6.png","/uploads/1758444230d03e1e67dc38eae73909af7f1e4250aa.png","/uploads/17584442534be60cf2f4973c8c67ce2e7546e77048.png","/uploads/1758444298bfbe655ac579fc218176719c4421c401.jpg","/uploads/1758444322d5fea7b32f8c3e63d4204d983c2da704.png","/uploads/1758444352740144125940b452c5defc6af16f7565.jpg","/uploads/17584444092e736a890625d6589f7fcc1222209bdf.jpg","/uploads/175844445198fb41b5ce724ccadb46820dc7d3950f.jpg","/uploads/17584444702f4bab646c116edfac36008a07017373.png","/uploads/1758444493ededdc472e1e8c79a0603bb41c1f30c6.png","/uploads/1758444518efd58fb9c789a610bb4591909b50e623.png","/uploads/1758444539a49035cd60f1b90d9d5066ce781140c8.png","/uploads/175844456630cb8a48a5cd63a278d1388e70b0833c.png","/uploads/1758444594f957a5a737c6a5759829c7d39d4788b2.jpg","/uploads/1758444632984cc7ff08e63f11d8be2169b8cf0deb.png","/uploads/1758444660accf48a2c3789f67e20f71ddff55a962.png","/uploads/1758444680e7c1ebf7631ab788430148b7fcee544e.png","/uploads/175844469952dd4c47de45e55350aa753faccd42ea.png","/uploads/1758444730ac2642a120b005f0e8bc3582eb11ee22.png","/uploads/17584447715d0c03d42df423a57757444458f9dfc4.png","/uploads/1758444792ee587145d01a6cc7e330ab711471b99e.png","/uploads/175844482181c372f4cc553bd93732d156a5fce219.png","/uploads/1758444843f0ae2f70ff77720b457a4e8e54858901.jpg","/uploads/175844488688943be6aa652b6efd8e38ca6093d1ef.png","/uploads/175844490612758d73feaf9755457b299e8e8dd784.png","/uploads/175844494558d1894f4a2dfcc21b16c25b132c80dc.jpg","/uploads/1758444970b3711d93aed22e50ebf38cc729885150.jpg","/uploads/17584449935e2a416ea254ff388643a4a41a4708f2.png","/uploads/1758445013e2cd09cceebdbb8ecf21a606a4c189cf.png","/uploads/1758445033915d4748d4fa089a491e932fa81daf60.png","/uploads/175844505269ea3b1e355be41d8e8444eb0e91c43f.png","/uploads/1758445092e74a59e70d42bbfc1f7cdca71112b46b.png","/uploads/17584451129be740b54fc836f9ef2b44c6b00c9f36.png","/uploads/1758445133c51ac7a36af70e098696a447fa5a53e0.png","/uploads/1758445159ba1147a237018d628c471437ee3f529d.png","/uploads/1758445186892594c3f9d4bf8e8c2a78fe5710284f.png","/uploads/175844520613da55c8edb8e1a6d013911fc5e59dc2.png","/uploads/1758445231f84126b860d309031e17db948c0e16b7.png","/uploads/1758445250640ae815f665354729f1f99d21df1d97.png","/uploads/175844526771a9e577b2eba096a3543e8571dce6bd.png","/uploads/17584452978d455d3bb1ed068bdea5685bed6bdd9d.png","/uploads/1758445315773fb3a39b240a4d87f56ae48eabb8c1.png","/uploads/17584453554b08eebd7506193763cb20a1a80f5791.jpg","/uploads/1758445376c571a4aee5eda1441ef269bf4b544bcc.jpg","/uploads/1758445395ecd4643d7a2d94bb7190ca8412811980.jpg","/uploads/1758445447e635ed522dce7f8e7af07af4d4e9b802.png","/uploads/17584454724ba08fad246b8e03c73a908f1626f99d.png","/uploads/17584454921c063e2f9dc1ddd11ac12e0d6c72d104.png","/uploads/1758445521cf2d012d192a37721f499dd497aa1ebf.png","/uploads/1758445538b50011bd06cd59320cd96fb439081f99.png","/uploads/1758445556d0c999840938778ae0776c895aaa3960.png","/uploads/1758445585a373dace1e5d417e5a4165993a5ce24e.png","/uploads/1758445604e1a6207c4b1460932090e502050988cb.png","/uploads/1758445622dc3dbc2e28dec2e02fb834462994f102.png","/uploads/1758445653212fdaf5f919ca2cbef5246511610fdc.png","/uploads/17584456737ce1c9bd5406d176636de22fc63ad769.png","/uploads/175844570415ca2e53ca71ff0a9686d8d4378cb32b.png","/uploads/1758445722521e5b2598b4e1a91b115e2e32ad171b.png","/uploads/1758445749ac620965b2ba2270c81d4dd15ee768a3.jpg","/uploads/1758445767c37b08192ac93df7d4fd97293a7689a9.png","/uploads/17584458172b689513c95fbcd88249e670aecdefe4.png","/uploads/1758445837d7a4a019924d2803b8183c8a73c81f5b.png","/uploads/17584458579b3e477ab8b7f3dc7ef57678a05bac61.png","/uploads/1758445875960fa9275412fa5fbc82c7cde367b84d.jpg","/uploads/175844589604c40dff8f5aa0a44d621d222307b83f.png","/uploads/1758445913cfe8d2518182dc5bec43ab252d1c7faa.png","/uploads/175844593187be72f37d034154b15c25d60e01367c.png","/uploads/1758445965edb73aa792a1e41009fde0e678c37656.png","/uploads/17584459853fe63bd0fada7ada02ba7466983dc059.png","/uploads/175844600834999942eabcf2435b80cef91a6353ff.png","/uploads/17584460262080f11e671c99cb77836d9ab98456aa.png","/uploads/1758446051fc498f806418e6302ba7d147a254fc8f.png","/uploads/1758446072bb4cdc57960268897b3b920789295333.png","/uploads/17584460907a9e0a530b280dbf907d0a6fdf14d2b8.png","/uploads/1758446107d8402615d84ddebc0f72e7ab07927869.png","/uploads/1758446126a09f466fe78e348fb4184c8ed83092f2.png","/uploads/17584461595596736cc319f7ab66ef1cbd32633ecb.png","/uploads/17584461780dca7ec73a3ce14c112ded525d7afcff.png","/uploads/17584461961d537d1f2fd2b88b3fcfdf5837542b41.png","/uploads/17584462160a2e19dfcb4467ef4d6d602184393aaf.png","/uploads/1758446235b01ed9b11aa41b9a9350bb6809639f26.png","/uploads/17584462548ab3a972a89bc2d336b7b4a9a505483c.png","/uploads/17584462731ab63f2bce29280c2f75ff77ac50b0b8.png","/uploads/1758446312f0979d6b69075561494346f25591159e.png","/uploads/17584463327aadc3d7a22e569107965d905146bc26.png","/uploads/175844635248bfe5d3d77ecf2cc697937bda5f910e.png","/uploads/17584463711397f2a0a02613ffc95db804448eaaad.png","/uploads/175844639201f4f172b94a9e5090234b3a88f54da0.png","/uploads/175844642072c93bd44a7c1576bd2a6e7656e266d5.png","/uploads/17584464396ae58f0cc8cad5cd70dc46c459b08255.png","/uploads/1758446461a2dc90d52a7bd3642f6d8b3112c54d07.png","/uploads/175844647792885997489f3b5e79dab6fadcf065a9.png","/uploads/1758446518d43d1a8d20e1b05749e59f3ef09de62c.png","/uploads/17584465385c8bb131c8a5f3f09048f81e51099e8c.png","/uploads/17584465576d6e95fe2c5a772c35a6e76992531aa1.jpg","/uploads/17584465786bcfc34825f67134631fd1d5c23bf43d.jpg","/uploads/1758446598a0f775a0d6c9db48a05078556f5d0fc2.png","/uploads/175844661765723087721c3e3b624022fbc26c2d60.png","/uploads/175844664171012b9f65ed1c04d465fcf2f17ca055.png","/uploads/17584466599c920f5df91773dd10867416d6ddd106.png","/uploads/1758446676fc1a97aad3fe69ffe6a8a78f6014e43f.png","/uploads/1758446693b666e97caba88e239605099ba0947f32.png","/uploads/175844671315cf452728775d689589da9500e2f6ae.png","/uploads/1758446731e2d8d39952f736d83c999badd29a2b94.png","/uploads/1758446755d018092687227b449d92e35537cf64db.png","/uploads/1758446777d3936d9f4c463126f52c57c448126535.png","/uploads/1758446813dce221f16ada124c694537a28e0c69e2.jpg","/uploads/17584468312dd15b4bc77f55a29f9ab995d98727ac.png","/uploads/17584468735cc5d891042c235c003fc4cecba2d5ec.jpg","/uploads/1758446892a71f4c68e5146eb2e3b1d49cc25e03e4.png","/uploads/1758446928c41373fe9ada7616e0722205cb914294.jpg","/uploads/1758446945dc4748953f46fd49fa9f02e33cadc76c.png","/uploads/1758446964f21a4493b3c9823b355280e0a23da9b4.png","/uploads/1758446982bcc67bba9e1daafc282ffef4d50e092e.png","/uploads/1758447011a0bcc786ea8fdc7bb264e22d02458d86.png","/uploads/1758447030df49d694c75c0a42b0c3b9ec1f68c318.png","/uploads/1758447057a1df6e52cc2a24dcf01bdf8a45de5320.png","/uploads/1758447076afbc4ead63e3f5f2c1d2540c2b7d795c.png","/uploads/17584470962cb9f2183512ca18d594f1ce01e74662.png","/uploads/175844711513c08770ff68e623df692b59ef6078c8.png","/uploads/17584471308a221bfa5d3a5211d845f2d44536a536.png","/uploads/1758447151c9a8e1ff90c8b8b5b171bf91dc318331.png","/uploads/17584471837da0a9b4a3b1e8f2c59e5a33517f6fa9.webp","/uploads/1758447211c2be5de5971e0995170a8aa066fb9aab.png","/uploads/1758447228894b79ec21c7aeb680cc03c694378d69.png","/uploads/17584472459b7df41147bef9923f3e4a2313fa0503.png","/uploads/175844726111a17834b90f98d053a9b39ec13beaf2.png","/uploads/1758447282960772ae9fd9feff4731fe61c3aca66e.png","/uploads/17584473252fca71f99a609adc1516a46a6f01abdc.png","/uploads/1758447362253ec279f9dabfa80bf1e52b3e319e1a.png","/uploads/17584473965fd78c97517bb74d7645e4db0a14376f.png","/uploads/1758447415c37aef317c24a23a75b19341e6827ecd.png","/uploads/17584474438eb855bef9827a3341bda836c78db07a.png","/uploads/1758447460891d6d6d581d40446c0e2b2987406c52.png","/uploads/1758447478de062287e4654a34b3c6d1e692c3d479.png","/uploads/17584474951656c971a69704dd28b59873afd104de.png","/uploads/17584475231dcb8eb1c6568acbc37b6e7419ec9b4c.png","/uploads/17584475387f3609969e07f22f1dbb3edbc07190f4.png","/uploads/1758447589c386675ab731eb519b87700a8df853e6.jpg","/uploads/1758447610408c56f0a336fdf9b1fcd4aee1eb9524.png","/uploads/1758447631b4b19c666a17c4833d29c82d95520069.jpg","/uploads/175844764965237b1b76e9de52bbe5070722c05597.png","/uploads/175844768962cd88acab01f4a9d0cd6c4dcb304ec6.jpg","/uploads/1758447706d0aa14721ba156c249bd13faf775c48a.png","/uploads/1758447724abe9c3aa5a923e3eabed807ce6b4dc20.png","/uploads/1758447741ceebbc106f6096010044bcf3732261b4.png","/uploads/1758447758cc3e845421d439a22941bd6f58c83a64.jpg","/uploads/1758447776e3302ed024834560cc9b3268f38751f8.png","/uploads/1758447793abfcff48f9dca154bdc0b1a137e0bbf7.png","/uploads/17584478141e9ab949d4e71073065e972a904fb64f.png","/uploads/1758447832a49f5ad6e436b0cca585d20092adb34f.png","/uploads/1758447850cf968ba20ff486e17b27c2a5b8e40804.png","/uploads/1758447870201cf2375a3ac5957a30cc07fee1a591.png","/uploads/1758447910dddb90a1f3c3838e2eba03dc552b9437.png","/uploads/1758447928ebf6dc64b6c21ac82830ba61d9a4fac7.jpg","/uploads/1758447947aec52029b3d5da35ac6eea7438830ee4.png","/uploads/1758447965d33753d43fc06003ec7143fe9ce93d9b.png","/uploads/1758447992421a610d70b02d2d6e6a9746f6e69460.avif","/uploads/1758448016be8f3654fb5c68dffadf59317074ddae.png","/uploads/1758448038beadc0929846be6be21c39b87ce73a7e.jpeg","/uploads/175844805991ed9551382258f3cb79c3c9e4d5a35e.jpeg","/uploads/175844807835f7dc7545d8e2096aa9f4912235c5a4.png","/uploads/17584481003c7ee27e39e829c44654b5dbe5b9cbc4.jpg","/uploads/1758448118348b0f4718798abd6204023a6a6205d0.png","/uploads/1758448150f3fe0e57e8a3f9c5f060c9f1a1e4c5d4.png","/uploads/17584481877dfe2436eadf91138cc67fe55b74de39.png","/uploads/175844822571800252a8bdbba3d31199554e34e719.png","/uploads/175844825366e155b0f8cc5ef16bd4e096524ed0d1.jpg","/uploads/1758448273646ce656dc44f2d084b997b5b1ec3de5.jpg","/uploads/17584483316756f23ecf62bf2e6eb9cca8bdbd4854.jpg","/uploads/175844870485fefbd0b04c254c23a8a819cfa00112.jpeg","/uploads/1758448727915359639c65b113faac70286372460c.jpg","/uploads/17584487448cb936d5bd33217c5719f1b93917704f.jpg","/uploads/1758448773d95d51a671eedba20c5a27eaeaf2f35b.jpg","/uploads/175844879240066f10ee9bf3916dc48b22bc2df45b.jpg","/uploads/17584488097b63c14201047f6c4b8992a7ccc62f5d.jpg","/uploads/1758448838e8f40625e0d8a1aa59a4d11f5d1ba05c.jpg","/uploads/1758448864979b19f4cb19a2e2643e03ddb5bde068.png","/uploads/1758448930530cf5b157283eb371a5ffb09d9835e4.webp","/uploads/17584489527e08ff95c53a203521dfca2ba61a1ea5.webp","/uploads/175844896875f31266857623cd69f91718f325e5e2.webp","/uploads/1758448986145bfe73c33655b9df363687728d9294.webp","/uploads/1758449006d0e7ff8033b15ffdd73a63dcb70446af.webp","/uploads/17584490431070ddd8dc5d1fb7f2eb2e894263ceb6.webp","/uploads/1758449074aaba27b47707a2567170698cb5673a43.webp","/uploads/17584490903562d744b163409740859e1e8b444f88.webp","/uploads/1758449111d195ef35c41dab95a280dc7c33a29951.png","/uploads/1758449131ae4a6764afbc57ba034b3fd3ade1440b.jpg","/uploads/1758449149c404bbcc2210bd89c603af6c8c67e41b.png","/uploads/1758449167cc887293ed17281cbcb264b585dfc619.png","/uploads/17584491849f88a00099b96795724a47a15bfdcdc9.png","/uploads/175844923174367475705c644461f3da254892bae1.png","/uploads/1758449251f20124cbe0714c976eebab391f4ae963.png","/uploads/17584492966c496a48c54a461066b0df4138f30601.png","/uploads/17584493147792a21845a804d6520d6dedd5ac5cd5.png","/uploads/17584493306b94802599327bdf5e7480eb3b801751.png","/uploads/175844934810ac5ccdfbd5245b1cfbfee9c12ca9bf.png","/uploads/17584493659e9d2531c8d684758336f72850ddaccf.jpg","/uploads/1758449382764d8de81ad8a5a222b627427e1f15da.png","/uploads/1758449403d6707be76d1a347929d0b3c420b5138f.jpg","/uploads/1758449420d24cd530046303e1d063578fcacd7e15.jpg","/uploads/17584494393df69c557eb7fe732fe293a3ffc0248e.jpg","/uploads/175844945582b088568149010f5be7b0d034c63f4d.png","/uploads/175844953302e7a80ff049cd807ae620004dd85017.png","/uploads/17584495610d685e802a3647f2172108a2364a2ab5.jpg","/uploads/17584495888f9046261f4270daa85854fc84863aca.avif","/uploads/17584496148a7b4766b2ae4bb568fbcdcab44c1576.png","/uploads/175844963933da45a790593e9a9c176edc21a33f77.png","/uploads/17584496615628b7641c23ed717864024857c960e3.png","/uploads/1758449688d13d388f458fb1f174920294ed1b3060.png","/uploads/1758449714d219def0759d1cf4f1fedc8e05d3cb9d.png","/uploads/1758449739fbbf00d2518c64583d09ff5a3139985c.png","/uploads/1758449795c4498516fa2cb8f19766a6e2b1955bed.png","/uploads/1758449853bb6fdb081532ca10cd2242b1752c88b9.png","/uploads/1758449870f64d0ece6fd25a661774fae79f540b25.png","/uploads/1758449886aed706b31c3fc9baa46cb08412782f1f.png","/uploads/17584499052ed6335e464884d510f42f78c67327b0.png","/uploads/1758449922054a0cc650150be3c07e9a1186b37c0c.png","/uploads/1758449955faddfa5fcab88a501b23e02fee6daecc.jpg","/uploads/1758449972cd0f60bec776500a00465af199d6ef55.png","/uploads/1758449992dd78efa27168bb410eaf92318e065988.jpg","/uploads/1758450008d47ddc6328152bc49b0ad7c15953d962.png","/uploads/1758450038138ba49690328d22b6231a6067680b87.jpg","/uploads/1758450060c6cda1bd54bd53e4b89d282b721c4f3a.png","/uploads/17584500773de85b5acc7be84301aa456f878db49c.png","/uploads/1758450093a823653ee65c1faa88da893f118b9a6b.png","/uploads/1758450110748931b46284b3a9bda91c14bf158dcd.jpg","/uploads/1758450132d0dfe58bc08e8e0aeb88c05c32a1fb03.png","/uploads/17584501531701a94fcc7239751520940aa43f4abf.png","/uploads/1758450173dc824923b24bfb72d13d83258894f6a8.png","/uploads/175845023703e959bb656bebe1fbd4002ad34774c8.png","/uploads/1758450272a00a6708947eefd8c2f01e80a664bc9e.png","/uploads/175845028968f84f400a0f050b43f47b323cf584ef.png","/uploads/1758450310a60f1d8f60b291bd76912e641d95c01b.png","/uploads/17584503315f5038fcb782907069e760d1bdabb1d1.png","/uploads/1758450349eb9dc75c94a49a75af47cc9e1355e075.png","/uploads/1758450367dc0844a19883b56d3542a4d4e435384b.png","/uploads/1758450385d79d2989792427e6f928e63f225d6c21.png","/uploads/17584504015160c1ab07d2c34d88a98ba422a9c6cc.png","/uploads/1758450423b480fb4e0b194ff89860f6c11757d523.png","/uploads/1758450443c431dc91145729965b44331129afcdc4.png","/uploads/17584504885b8b821cdbcb3bebdd837c125d8d1ff8.png","/uploads/1758450505bf042ed59efdd27249cc091288a43055.png","/uploads/175845054427719934f3075df2583d0d88d10c55ed.png","/uploads/1758450582c74b784d6935a0b57b5f59c4da2be44d.jpg","/uploads/1758450599e396f991773d333c8c023b8f6fdc3d2c.jpg","/uploads/175845061522c3ba5113d8f70baef9310e50ca0049.png","/uploads/1758450634dbde3145458da3435f67e7a83748e5bd.png","/uploads/1758450654c93da23a1b90fb9abba419defcb44109.png","/uploads/17584506740ccd03f78b87fd373cf351fcf493b86a.png","/uploads/1758450698e1c2466f7a35c9cdb9abfdf768da390d.png","/uploads/17584507287d814c1d47a82807a3bc3e7e5775d290.png","/uploads/17584507452001239cc28f9cf42baa5b6eddbef704.png","/uploads/1758450762483526c7b660244a74b98aae492c9aab.png","/uploads/17584507829d238b7e2d7242be511dc47316fc9ff5.png","/uploads/175845081257132983aebb0c79ed04fc88a8d5ee1f.png","/uploads/1758450829016d0685d169a7aaa39a7137ff25a19a.jpg","/uploads/1758734493b56bdd548d5f0a1bc5a5b93ad4acac11.pdf","/uploads/175873458588b47ff0285e4191b61baeb524ba2d36.jpg","/uploads/175873463288b47ff0285e4191b61baeb524ba2d36.jpg","/uploads/1758734666b56bdd548d5f0a1bc5a5b93ad4acac11.pdf","/uploads/175873468888b47ff0285e4191b61baeb524ba2d36.jpg","/uploads/1758734698b56bdd548d5f0a1bc5a5b93ad4acac11.pdf","/uploads/1758734896360a03da87cb7088be0c87ff8c5bce7a.jpg","/uploads/1758735021360a03da87cb7088be0c87ff8c5bce7a.jpg","/uploads/1758735041360a03da87cb7088be0c87ff8c5bce7a.jpg","/uploads/1758735057d4772a90c8f8218794525f4cbb87fcfa.pdf","/uploads/1758735180d4772a90c8f8218794525f4cbb87fcfa.pdf","/uploads/1758735198d4772a90c8f8218794525f4cbb87fcfa.pdf","/uploads/175874991588b47ff0285e4191b61baeb524ba2d36.jpg","/uploads/1758749964e09c4c1e5566d75e308d8a58784692a9.pdf","/uploads/175874997888b47ff0285e4191b61baeb524ba2d36.jpg","/uploads/1758749983e09c4c1e5566d75e308d8a58784692a9.pdf","/uploads/175874999388b47ff0285e4191b61baeb524ba2d36.jpg","/uploads/1758749999e09c4c1e5566d75e308d8a58784692a9.pdf","/uploads/175875067588b47ff0285e4191b61baeb524ba2d36.jpg","/uploads/175875071442d0c46366cac1811adc7331b9075ef6.pdf","/uploads/175875072588b47ff0285e4191b61baeb524ba2d36.jpg","/uploads/175875073042d0c46366cac1811adc7331b9075ef6.pdf","/uploads/17587515388160d74cb5b8a8d8d0aef4b5ae2bf101.jpg","/uploads/175875154541cee93dee8e7c9f4a2fd13a463e77bd.pdf","/uploads/17587516078160d74cb5b8a8d8d0aef4b5ae2bf101.jpg","/uploads/175875161641cee93dee8e7c9f4a2fd13a463e77bd.pdf","/uploads/17587517048160d74cb5b8a8d8d0aef4b5ae2bf101.jpg","/uploads/175875171341cee93dee8e7c9f4a2fd13a463e77bd.pdf","/uploads/17587517288160d74cb5b8a8d8d0aef4b5ae2bf101.jpg","/uploads/175875173841cee93dee8e7c9f4a2fd13a463e77bd.pdf","/uploads/175875176341cee93dee8e7c9f4a2fd13a463e77bd.pdf","/uploads/17587517678160d74cb5b8a8d8d0aef4b5ae2bf101.jpg","/uploads/17587517888160d74cb5b8a8d8d0aef4b5ae2bf101.jpg","/uploads/175875179641cee93dee8e7c9f4a2fd13a463e77bd.pdf","/uploads/175875181341cee93dee8e7c9f4a2fd13a463e77bd.pdf","/uploads/17587518178160d74cb5b8a8d8d0aef4b5ae2bf101.jpg","/uploads/17587518438160d74cb5b8a8d8d0aef4b5ae2bf101.jpg","/uploads/175875186041cee93dee8e7c9f4a2fd13a463e77bd.pdf","/uploads/1758752125d914fc621a29611ec13d39b88c17bb23.jpg","/uploads/17587523541174546a46ace33b79f50efdcc7755ee.pdf","/uploads/1758752370d914fc621a29611ec13d39b88c17bb23.jpg","/uploads/17587523761174546a46ace33b79f50efdcc7755ee.pdf","/uploads/1758752388d914fc621a29611ec13d39b88c17bb23.jpg","/uploads/17587523941174546a46ace33b79f50efdcc7755ee.pdf","/uploads/175875267388b47ff0285e4191b61baeb524ba2d36.jpg","/uploads/175875268300106ef98f48e81048654361a0fc6b01.pdf","/uploads/175875270488b47ff0285e4191b61baeb524ba2d36.jpg","/uploads/175875271300106ef98f48e81048654361a0fc6b01.pdf","/uploads/175875272988b47ff0285e4191b61baeb524ba2d36.jpg","/uploads/175875273500106ef98f48e81048654361a0fc6b01.pdf","/uploads/175875275588b47ff0285e4191b61baeb524ba2d36.jpg","/uploads/175875276400106ef98f48e81048654361a0fc6b01.pdf","/uploads/175875280188b47ff0285e4191b61baeb524ba2d36.jpg","/uploads/175875280800106ef98f48e81048654361a0fc6b01.pdf","/uploads/17587530249efce93260cb816540e08a03b9f5a819.jpg","/uploads/1758753124dab6e82c51f8163218459b4fc1b06e68.pdf","/uploads/17587531529efce93260cb816540e08a03b9f5a819.jpg","/uploads/1758753158dab6e82c51f8163218459b4fc1b06e68.pdf","/uploads/17587532939efce93260cb816540e08a03b9f5a819.jpg","/uploads/175875336025ff2c39c5652b058eee4e9d9cd91c6d.pdf","/uploads/1758753744f68cc5d2d5bc5d033404160baf5268cf.pdf","/uploads/1758758468db2a4fd0553736076ab58b2bf8696055.pdf","/uploads/1758758834493d0b5c1bed7ff1331ebfc0bf47ad53.jpg","/uploads/1758758886660835d5fcdf96dcb1418d29c7118206.pdf","/uploads/17587589589efce93260cb816540e08a03b9f5a819.jpg","/uploads/1758758975493d0b5c1bed7ff1331ebfc0bf47ad53.jpg","/uploads/1758758982660835d5fcdf96dcb1418d29c7118206.pdf","/uploads/1758759372493d0b5c1bed7ff1331ebfc0bf47ad53.jpg","/uploads/1758759525493d0b5c1bed7ff1331ebfc0bf47ad53.jpg","/uploads/17587643484798143308fa0c413cdeee1394a54157.pdf","/uploads/175876435488b47ff0285e4191b61baeb524ba2d36.jpg","/uploads/175876456388b47ff0285e4191b61baeb524ba2d36.jpg","/uploads/17587645720cba905f8c08ec6e69a89a8bd62c85a9.pdf","/uploads/1758833085280d75e312f372412d019239f1eb692e.jpg","/uploads/1758834479280d75e312f372412d019239f1eb692e.jpg","/uploads/1758834645d912dc0a839981aa2e0b342e77309034.pdf","/uploads/1758834749015639b8c25669b0e399969e4ca45fbb.pdf","/uploads/1758834775280d75e312f372412d019239f1eb692e.jpg","/uploads/1758834810d912dc0a839981aa2e0b342e77309034.pdf","/uploads/1758835253280d75e312f372412d019239f1eb692e.jpg","/uploads/1758835393015639b8c25669b0e399969e4ca45fbb.pdf","/uploads/1758835564280d75e312f372412d019239f1eb692e.jpg","/uploads/1758835571d912dc0a839981aa2e0b342e77309034.pdf","/uploads/1758835601280d75e312f372412d019239f1eb692e.jpg","/uploads/1758835611d912dc0a839981aa2e0b342e77309034.pdf","/uploads/1758835655280d75e312f372412d019239f1eb692e.jpg","/uploads/1758835818538d0d72a23a376d2d3db49735e672e5.pdf","/uploads/1758835892280d75e312f372412d019239f1eb692e.jpg","/uploads/1758835899538d0d72a23a376d2d3db49735e672e5.pdf","/uploads/1758835989280d75e312f372412d019239f1eb692e.jpg","/uploads/1758835995015639b8c25669b0e399969e4ca45fbb.pdf","/uploads/1758836117280d75e312f372412d019239f1eb692e.jpg","/uploads/175883615179a05530d5bf1b3b2e0f87bb641907f9.pdf","/uploads/1758836337280d75e312f372412d019239f1eb692e.jpg","/uploads/1758836358280d75e312f372412d019239f1eb692e.jpg","/uploads/1758836383280d75e312f372412d019239f1eb692e.jpg","/uploads/1758836400015639b8c25669b0e399969e4ca45fbb.pdf","/uploads/1758836424280d75e312f372412d019239f1eb692e.jpg","/uploads/175883649282b4a17c86c46e0eabe7a6dbf9d3c303.pdf","/uploads/1758836519280d75e312f372412d019239f1eb692e.jpg","/uploads/175883663231c80db1801b0ef28fe9d277dfa54037.pdf","/uploads/1758836661280d75e312f372412d019239f1eb692e.jpg","/uploads/175883666831c80db1801b0ef28fe9d277dfa54037.pdf","/uploads/1758836682280d75e312f372412d019239f1eb692e.jpg","/uploads/1758839930847403f34dcddc1fc9bac9407e0a6045.jpg","/uploads/1758839950847403f34dcddc1fc9bac9407e0a6045.jpg","/uploads/1758839983847403f34dcddc1fc9bac9407e0a6045.jpg","/uploads/1758839997847403f34dcddc1fc9bac9407e0a6045.jpg","/uploads/1758840007847403f34dcddc1fc9bac9407e0a6045.jpg","/uploads/1758840017847403f34dcddc1fc9bac9407e0a6045.jpg","/uploads/1758840030847403f34dcddc1fc9bac9407e0a6045.jpg","/uploads/1758840044847403f34dcddc1fc9bac9407e0a6045.jpg","/uploads/1758840057847403f34dcddc1fc9bac9407e0a6045.jpg","/uploads/1758840141985662c0e851e1d251b41fb636217ce0.pdf","/uploads/1758840278264cbb5b584b08f4d1c6c4e018d38a5e.pdf","/uploads/1758840306264cbb5b584b08f4d1c6c4e018d38a5e.pdf","/uploads/1758840318264cbb5b584b08f4d1c6c4e018d38a5e.pdf","/uploads/1758840331264cbb5b584b08f4d1c6c4e018d38a5e.pdf","/uploads/1758840350264cbb5b584b08f4d1c6c4e018d38a5e.pdf","/uploads/1758840361264cbb5b584b08f4d1c6c4e018d38a5e.pdf","/uploads/1758840486736bd684721e7b085f1ad5de88380765.pdf","/uploads/1758840572f70fbae44454e46d2eafc73729cb9396.pdf","/uploads/17589330609c416ae0a88eaf3fdffc81e99b8e0b03.jpg","/uploads/175893322689aa45f074b645c643b724a1634e37d3.pdf","/uploads/17589333999c416ae0a88eaf3fdffc81e99b8e0b03.jpg","/uploads/1758933794cc801f42da5567ac441d23743f54b0c4.pdf","/uploads/17589344699c416ae0a88eaf3fdffc81e99b8e0b03.jpg","/uploads/1758934729b1090427b2c1bb65b963ac8e067c3724.pdf","/uploads/17589347699c416ae0a88eaf3fdffc81e99b8e0b03.jpg","/uploads/1758934777b1090427b2c1bb65b963ac8e067c3724.pdf","/uploads/17589348749c416ae0a88eaf3fdffc81e99b8e0b03.jpg","/uploads/17589351760194549ced8a647027aa5312fe671ecd.pdf","/uploads/17589352229c416ae0a88eaf3fdffc81e99b8e0b03.jpg","/uploads/17589352320194549ced8a647027aa5312fe671ecd.pdf","/uploads/17589352579c416ae0a88eaf3fdffc81e99b8e0b03.jpg","/uploads/17589352670194549ced8a647027aa5312fe671ecd.pdf","/uploads/17589353389c416ae0a88eaf3fdffc81e99b8e0b03.jpg","/uploads/1758935684ffda7caf83b545bb31af922e05c9b764.pdf","/uploads/17589361989c416ae0a88eaf3fdffc81e99b8e0b03.jpg","/uploads/1758936253deee74c7f0b5759db0c0b4801f0d54d3.pdf","/uploads/17589362859c416ae0a88eaf3fdffc81e99b8e0b03.jpg","/uploads/1758936368b46234c263c5913111278afbd282331a.pdf","/uploads/17589366589c416ae0a88eaf3fdffc81e99b8e0b03.jpg","/uploads/1758936669d12e56111d2c1b465b7749346b3b56ae.pdf","/uploads/17589366879c416ae0a88eaf3fdffc81e99b8e0b03.jpg","/uploads/1758936693d12e56111d2c1b465b7749346b3b56ae.pdf","/uploads/17589367139c416ae0a88eaf3fdffc81e99b8e0b03.jpg","/uploads/1758936868cbbcd21e95d1b675f6397cbd04d24363.pdf","/uploads/17589372139c416ae0a88eaf3fdffc81e99b8e0b03.jpg","/uploads/1758937403de2852b14f5216875f91287acf9dd98a.pdf","/uploads/17589374199c416ae0a88eaf3fdffc81e99b8e0b03.jpg","/uploads/175898533581b5b6ff27cf07ca6c6cc4e76f08a6d8.pdf","/uploads/175898541988b47ff0285e4191b61baeb524ba2d36.jpg","/uploads/17589863118fcf8a38f385498d877577dbdf0714f2.jpg","/uploads/17589864176b8a2f4d6c45539b77a995de262444c7.pdf","/uploads/17589878328fcf8a38f385498d877577dbdf0714f2.jpg","/uploads/17589878518fcf8a38f385498d877577dbdf0714f2.jpg","/uploads/17589878878fcf8a38f385498d877577dbdf0714f2.jpg","/uploads/17589879078fcf8a38f385498d877577dbdf0714f2.jpg","/uploads/17589879708fcf8a38f385498d877577dbdf0714f2.jpg","/uploads/17589879858fcf8a38f385498d877577dbdf0714f2.jpg","/uploads/17589882998fcf8a38f385498d877577dbdf0714f2.jpg","/uploads/17589883128fcf8a38f385498d877577dbdf0714f2.jpg","/uploads/17589883368fcf8a38f385498d877577dbdf0714f2.jpg","/uploads/17589883548fcf8a38f385498d877577dbdf0714f2.jpg","/uploads/17589883748fcf8a38f385498d877577dbdf0714f2.jpg","/uploads/17589883928fcf8a38f385498d877577dbdf0714f2.jpg","/uploads/17589884078fcf8a38f385498d877577dbdf0714f2.jpg","/uploads/17589884248fcf8a38f385498d877577dbdf0714f2.jpg","/uploads/17589884468fcf8a38f385498d877577dbdf0714f2.jpg","/uploads/17589885558fcf8a38f385498d877577dbdf0714f2.jpg","/uploads/17589885708fcf8a38f385498d877577dbdf0714f2.jpg","/uploads/17589885828fcf8a38f385498d877577dbdf0714f2.jpg","/uploads/17589885978fcf8a38f385498d877577dbdf0714f2.jpg","/uploads/17589886118fcf8a38f385498d877577dbdf0714f2.jpg","/uploads/1758988906771f9c93904a62917e470d7c5d261085.pdf","/uploads/1758997156d367452952e7f0c31a9abddd88880af7.pdf","/uploads/1758997639664f679dd20721965af733f3b6419f9f.jpg","/uploads/1758997689664f679dd20721965af733f3b6419f9f.jpg","/uploads/1758997704664f679dd20721965af733f3b6419f9f.jpg","/uploads/1758997720664f679dd20721965af733f3b6419f9f.jpg","/uploads/1758997735664f679dd20721965af733f3b6419f9f.jpg","/uploads/1758997747664f679dd20721965af733f3b6419f9f.jpg","/uploads/1758997763664f679dd20721965af733f3b6419f9f.jpg","/uploads/17589992913266f6cfb19dec009a92e404e05d4489.pdf","/uploads/17589993179c416ae0a88eaf3fdffc81e99b8e0b03.jpg","/uploads/17589993353266f6cfb19dec009a92e404e05d4489.pdf","/uploads/17589993899c416ae0a88eaf3fdffc81e99b8e0b03.jpg","/uploads/17589994336f64962754a1a5f7ec0b174208d391c9.pdf","/uploads/1758999504ca18c9e59788b9ba9265d8e7b2354208.jpg","/uploads/17589995577d782fd94a4de61ec96c7183c1911952.pdf","/uploads/1758999587ca18c9e59788b9ba9265d8e7b2354208.jpg","/uploads/17589995947d782fd94a4de61ec96c7183c1911952.pdf","/uploads/1758999649ca18c9e59788b9ba9265d8e7b2354208.jpg","/uploads/17589996577d782fd94a4de61ec96c7183c1911952.pdf","/uploads/1758999750ca18c9e59788b9ba9265d8e7b2354208.jpg","/uploads/17589997575ae088e7eb7b67433e28ccbe42b993ca.pdf","/uploads/1758999777ca18c9e59788b9ba9265d8e7b2354208.jpg","/uploads/1758999822ad52bdb70386148438c8e94f5dcaf8f0.pdf","/uploads/1758999848ca18c9e59788b9ba9265d8e7b2354208.jpg","/uploads/175899996354ff0d7ad550b6c6dc70f16e0be32f17.pdf","/uploads/1758999970ca18c9e59788b9ba9265d8e7b2354208.jpg","/uploads/1759000013ca18c9e59788b9ba9265d8e7b2354208.jpg","/uploads/175900028723e6a3e3e9e680c9c240b1b8ef5fb823.pdf","/uploads/1759000470ca18c9e59788b9ba9265d8e7b2354208.jpg","/uploads/1759000479285513e936215daddeaed43efb9af288.pdf","/uploads/1759000539ca18c9e59788b9ba9265d8e7b2354208.jpg","/uploads/175900103872d312dc14048fee0fd8fe67bb2331d0.pdf","/uploads/17590011790372d7aa769086a430f324efb8f9d372.png","/uploads/1759001186ca18c9e59788b9ba9265d8e7b2354208.jpg","/uploads/175900119272d312dc14048fee0fd8fe67bb2331d0.pdf","/uploads/1759001742ca18c9e59788b9ba9265d8e7b2354208.jpg","/uploads/1759001803ca18c9e59788b9ba9265d8e7b2354208.jpg","/uploads/17590022031091e576187a49d443aab1a81faeab2e.pdf","/uploads/1759002324ca18c9e59788b9ba9265d8e7b2354208.jpg","/uploads/1759002332cea1da4a58ec19fafcb6f7a23bab90e2.pdf","/uploads/1759002404ca18c9e59788b9ba9265d8e7b2354208.jpg","/uploads/1759002412cea1da4a58ec19fafcb6f7a23bab90e2.pdf","/uploads/1759002593ca18c9e59788b9ba9265d8e7b2354208.jpg","/uploads/17590026021091e576187a49d443aab1a81faeab2e.pdf","/uploads/1759002624ca18c9e59788b9ba9265d8e7b2354208.jpg","/uploads/1759002794ca18c9e59788b9ba9265d8e7b2354208.jpg","/uploads/17590028420813907b2e55509b765204f9be3aa20f.pdf","/uploads/1759002865ca18c9e59788b9ba9265d8e7b2354208.jpg","/uploads/17590028741091e576187a49d443aab1a81faeab2e.pdf","/uploads/17590029141091e576187a49d443aab1a81faeab2e.pdf","/uploads/1759003072ca18c9e59788b9ba9265d8e7b2354208.jpg","/uploads/17590031208765acfe6b6011b15a48d3c2846a2f60.pdf","/uploads/1759003168ca18c9e59788b9ba9265d8e7b2354208.jpg","/uploads/1759003200768f663d07cd78a952e9648805af16a2.pdf","/uploads/1759003230ca18c9e59788b9ba9265d8e7b2354208.jpg","/uploads/1759003239768f663d07cd78a952e9648805af16a2.pdf","/uploads/1759003683ca18c9e59788b9ba9265d8e7b2354208.jpg","/uploads/17590037378f7284a46ea59b2d541b637ac09c53d8.pdf","/uploads/1759003918b70f0e78a7f5542e708afd8dbbbc2e3d.jpg","/uploads/1759003957ea4a451998f9cddfb27840993cdbe00c.pdf","/uploads/1759004007b70f0e78a7f5542e708afd8dbbbc2e3d.jpg","/uploads/1759004031b5689e098d48610eb9f229601ad56b98.pdf","/uploads/1759004153b70f0e78a7f5542e708afd8dbbbc2e3d.jpg","/uploads/1759004172b70f0e78a7f5542e708afd8dbbbc2e3d.jpg","/uploads/17590042397f7fb4a45c04eaf5925b3e2aa38be3ad.pdf","/uploads/1759004323b70f0e78a7f5542e708afd8dbbbc2e3d.jpg","/uploads/17590043447f7fb4a45c04eaf5925b3e2aa38be3ad.pdf","/uploads/1759004366b70f0e78a7f5542e708afd8dbbbc2e3d.jpg","/uploads/17590043747f7fb4a45c04eaf5925b3e2aa38be3ad.pdf","/uploads/1759004389b70f0e78a7f5542e708afd8dbbbc2e3d.jpg","/uploads/17590043967f7fb4a45c04eaf5925b3e2aa38be3ad.pdf","/uploads/1759004418b70f0e78a7f5542e708afd8dbbbc2e3d.jpg","/uploads/17590044257f7fb4a45c04eaf5925b3e2aa38be3ad.pdf","/uploads/17590045131d1f8212c9d7281f05c522bae9c30a7d.jpg","/uploads/17590045801d1f8212c9d7281f05c522bae9c30a7d.jpg","/uploads/17590046231d1f8212c9d7281f05c522bae9c30a7d.jpg","/uploads/17590047321e72409c3d5904b10a70699010b04939.pdf","/uploads/175900475449de65f01ce16e0ef0251342cc067a6a.pdf","/uploads/175900477649de65f01ce16e0ef0251342cc067a6a.pdf","/uploads/17590048491d1f8212c9d7281f05c522bae9c30a7d.jpg","/uploads/175900487519f4ad07cfbb0b3d239213e74c659208.pdf","/uploads/17590049791d1f8212c9d7281f05c522bae9c30a7d.jpg","/uploads/17590050021d1f8212c9d7281f05c522bae9c30a7d.jpg","/uploads/1759005046be494a6bd7934dd3350aa1543f90fed1.pdf","/uploads/17590050801d1f8212c9d7281f05c522bae9c30a7d.jpg","/uploads/175900513440eb864f86911fa9641cb2166ed45e63.pdf","/uploads/1759705364d8fb95fd2955a05e858844b7f2306abd.jpg","/uploads/1759705439a4b25d844ff62630c82dc26467d59451.pdf","/uploads/1759705597d8fb95fd2955a05e858844b7f2306abd.jpg","/uploads/1759705605c535aaa92bfb8b71c7e19f08b1f2c28f.pdf","/uploads/1759705797d8fb95fd2955a05e858844b7f2306abd.jpg","/uploads/1759705805c535aaa92bfb8b71c7e19f08b1f2c28f.pdf","/uploads/1759705825d8fb95fd2955a05e858844b7f2306abd.jpg","/uploads/1759705833c535aaa92bfb8b71c7e19f08b1f2c28f.pdf","/uploads/1759705852d8fb95fd2955a05e858844b7f2306abd.jpg","/uploads/1759705860c535aaa92bfb8b71c7e19f08b1f2c28f.pdf","/uploads/1759705875d8fb95fd2955a05e858844b7f2306abd.jpg","/uploads/1759705882c535aaa92bfb8b71c7e19f08b1f2c28f.pdf","/uploads/1759705900d8fb95fd2955a05e858844b7f2306abd.jpg","/uploads/1759705908c535aaa92bfb8b71c7e19f08b1f2c28f.pdf","/uploads/1759705924d8fb95fd2955a05e858844b7f2306abd.jpg","/uploads/1759705929c535aaa92bfb8b71c7e19f08b1f2c28f.pdf","/uploads/1759705953d8fb95fd2955a05e858844b7f2306abd.jpg","/uploads/1759705958c535aaa92bfb8b71c7e19f08b1f2c28f.pdf","/uploads/1759705977d8fb95fd2955a05e858844b7f2306abd.jpg","/uploads/1759705983c535aaa92bfb8b71c7e19f08b1f2c28f.pdf","/uploads/1759706003d8fb95fd2955a05e858844b7f2306abd.jpg","/uploads/1759706048c535aaa92bfb8b71c7e19f08b1f2c28f.pdf","/uploads/1759706070d8fb95fd2955a05e858844b7f2306abd.jpg","/uploads/1759706076c535aaa92bfb8b71c7e19f08b1f2c28f.pdf","/uploads/1759706094d8fb95fd2955a05e858844b7f2306abd.jpg","/uploads/1759706101c535aaa92bfb8b71c7e19f08b1f2c28f.pdf","/uploads/1759706126d8fb95fd2955a05e858844b7f2306abd.jpg","/uploads/1759706133c535aaa92bfb8b71c7e19f08b1f2c28f.pdf","/uploads/17597065789f4084ee95ba9e95dda94c5ae23e5927.pdf","/uploads/1759706615adaa1af7f5b88cca913521bebe3ccf3a.jpg","/uploads/1759706848adaa1af7f5b88cca913521bebe3ccf3a.jpg","/uploads/17597068529f4084ee95ba9e95dda94c5ae23e5927.pdf","/uploads/1759706865adaa1af7f5b88cca913521bebe3ccf3a.jpg","/uploads/17597068699f4084ee95ba9e95dda94c5ae23e5927.pdf","/uploads/1759706892adaa1af7f5b88cca913521bebe3ccf3a.jpg","/uploads/17597068979f4084ee95ba9e95dda94c5ae23e5927.pdf","/uploads/1759706915adaa1af7f5b88cca913521bebe3ccf3a.jpg","/uploads/17597069209f4084ee95ba9e95dda94c5ae23e5927.pdf","/uploads/1759706936adaa1af7f5b88cca913521bebe3ccf3a.jpg","/uploads/17597069419f4084ee95ba9e95dda94c5ae23e5927.pdf","/uploads/1759706959adaa1af7f5b88cca913521bebe3ccf3a.jpg","/uploads/17597069639f4084ee95ba9e95dda94c5ae23e5927.pdf","/uploads/1759707018adaa1af7f5b88cca913521bebe3ccf3a.jpg","/uploads/1759707103a9785474289ccd59284a29b431d9d311.pdf","/uploads/1759707201adaa1af7f5b88cca913521bebe3ccf3a.jpg","/uploads/1759707206a9785474289ccd59284a29b431d9d311.pdf","/uploads/17597074040f7ea1dbdd99c3b8249781f75028035d.jpg","/uploads/17597074765d0fdd822c4528bc400429fd2eff3d1e.pdf","/uploads/17597075100f7ea1dbdd99c3b8249781f75028035d.jpg","/uploads/17597075165d0fdd822c4528bc400429fd2eff3d1e.pdf","/uploads/17597075370f7ea1dbdd99c3b8249781f75028035d.jpg","/uploads/17597075415d0fdd822c4528bc400429fd2eff3d1e.pdf","/uploads/17597075580f7ea1dbdd99c3b8249781f75028035d.jpg","/uploads/17597075615d0fdd822c4528bc400429fd2eff3d1e.pdf","/uploads/17597075710f7ea1dbdd99c3b8249781f75028035d.jpg","/uploads/17597075775d0fdd822c4528bc400429fd2eff3d1e.pdf","/uploads/17597075940f7ea1dbdd99c3b8249781f75028035d.jpg","/uploads/17597075985d0fdd822c4528bc400429fd2eff3d1e.pdf","/uploads/17597076140f7ea1dbdd99c3b8249781f75028035d.jpg","/uploads/17597076185d0fdd822c4528bc400429fd2eff3d1e.pdf","/uploads/17597076350f7ea1dbdd99c3b8249781f75028035d.jpg","/uploads/17597076395d0fdd822c4528bc400429fd2eff3d1e.pdf","/uploads/17597076530f7ea1dbdd99c3b8249781f75028035d.jpg","/uploads/17597076625d0fdd822c4528bc400429fd2eff3d1e.pdf","/uploads/17597076830f7ea1dbdd99c3b8249781f75028035d.jpg","/uploads/17597076885d0fdd822c4528bc400429fd2eff3d1e.pdf","/uploads/17597077280f7ea1dbdd99c3b8249781f75028035d.jpg","/uploads/17597077325d0fdd822c4528bc400429fd2eff3d1e.pdf","/uploads/17597077440f7ea1dbdd99c3b8249781f75028035d.jpg","/uploads/17597077475d0fdd822c4528bc400429fd2eff3d1e.pdf","/uploads/17597078070f7ea1dbdd99c3b8249781f75028035d.jpg","/uploads/17597078115d0fdd822c4528bc400429fd2eff3d1e.pdf","/uploads/17597078230f7ea1dbdd99c3b8249781f75028035d.jpg","/uploads/17597078275d0fdd822c4528bc400429fd2eff3d1e.pdf","/uploads/17597078430f7ea1dbdd99c3b8249781f75028035d.jpg","/uploads/17597078475d0fdd822c4528bc400429fd2eff3d1e.pdf","/uploads/17597078590f7ea1dbdd99c3b8249781f75028035d.jpg","/uploads/17597078635d0fdd822c4528bc400429fd2eff3d1e.pdf","/uploads/17597078900f7ea1dbdd99c3b8249781f75028035d.jpg","/uploads/17597078945d0fdd822c4528bc400429fd2eff3d1e.pdf","/uploads/17597079090f7ea1dbdd99c3b8249781f75028035d.jpg","/uploads/17597079125d0fdd822c4528bc400429fd2eff3d1e.pdf","/uploads/17597079260f7ea1dbdd99c3b8249781f75028035d.jpg","/uploads/17597079305d0fdd822c4528bc400429fd2eff3d1e.pdf","/uploads/17597079450f7ea1dbdd99c3b8249781f75028035d.jpg","/uploads/17597079525d0fdd822c4528bc400429fd2eff3d1e.pdf","/uploads/17597079680f7ea1dbdd99c3b8249781f75028035d.jpg","/uploads/17597079725d0fdd822c4528bc400429fd2eff3d1e.pdf","/uploads/17597079830f7ea1dbdd99c3b8249781f75028035d.jpg","/uploads/17597079875d0fdd822c4528bc400429fd2eff3d1e.pdf","/uploads/17597082318d9e1077b92f57734101016df479192a.jpg","/uploads/1759708236303fe056562ee486fd48e45c9ed9d3d7.pdf","/uploads/17597083188d9e1077b92f57734101016df479192a.jpg","/uploads/1759708322303fe056562ee486fd48e45c9ed9d3d7.pdf","/uploads/1759708539db50cc877ac074eab4ab5f770716d006.pdf","/uploads/1759708573db50cc877ac074eab4ab5f770716d006.pdf","/uploads/175970902117ec6620c95614ca1779d149d72252d2.pdf","/uploads/1759709297db50cc877ac074eab4ab5f770716d006.pdf","/uploads/1759709355db50cc877ac074eab4ab5f770716d006.pdf","/uploads/175970965492db8cbe5447f2c64b0c95cd272b83a5.pdf","/uploads/17597097339b33c6625262480ccbc9dbca34ab03f3.pdf","/uploads/175970985669ff5420f1bf6cd0f23148e94bf0c8de.pdf","/uploads/175970990844d8204380824a1b8954fe4ae5e1aa94.pdf","/uploads/1759710125ccd9e794d7f3301489ad88643748d1a2.jpg","/uploads/1759710182c030576162f047674c2189ccac85637d.pdf","/uploads/1759710498ca58d676d87e677f9447e3b763afe9b2.pdf","/uploads/175971054392db8cbe5447f2c64b0c95cd272b83a5.pdf","/uploads/1759710868b1aa7b47479278781adf56a0521f1aa9.pdf","/uploads/1759711017ccd9e794d7f3301489ad88643748d1a2.jpg","/uploads/1759711065b0e9adc2500d3c786a50574cd38d99c1.pdf","/uploads/1759711238ccd9e794d7f3301489ad88643748d1a2.jpg","/uploads/175971124488bfb1553a845c58b3f2d5d9ec67071d.pdf","/uploads/1759715016b8881992cba2d6ae27414445daddd79c.pdf","/uploads/1759715020ccd9e794d7f3301489ad88643748d1a2.jpg","/uploads/1759715194b850e3428dc30ebbff1a511882abdbe6.jpg","/uploads/1759715343cde301cc8ec593e82f9dc7a790e737f5.pdf","/uploads/1759715358ccd9e794d7f3301489ad88643748d1a2.jpg","/uploads/1759715397ccd9e794d7f3301489ad88643748d1a2.jpg","/uploads/1759716123b70f0e78a7f5542e708afd8dbbbc2e3d.jpg","/uploads/1759716423924de98b9d695aad08eff4fcd1eb492f.pdf","/uploads/1759716466b70f0e78a7f5542e708afd8dbbbc2e3d.jpg","/uploads/1759717097b70f0e78a7f5542e708afd8dbbbc2e3d.jpg","/uploads/1759717173975680b4a1ec4669f6a33758a23b08f7.pdf","/uploads/1759717487b70f0e78a7f5542e708afd8dbbbc2e3d.jpg","/uploads/1759717494975680b4a1ec4669f6a33758a23b08f7.pdf","/uploads/1759717638b70f0e78a7f5542e708afd8dbbbc2e3d.jpg","/uploads/1759717731decb6a21660d60430fb31be83e071a34.pdf","/uploads/1759717764b70f0e78a7f5542e708afd8dbbbc2e3d.jpg","/uploads/1759717771decb6a21660d60430fb31be83e071a34.pdf","/uploads/1759717818b70f0e78a7f5542e708afd8dbbbc2e3d.jpg","/uploads/1759717922f460b539440286bb5939fda480b56cfe.pdf","/uploads/1759718276e0f40099f6a15c99ad43ce859ceed9ad.jpg","/uploads/1759718289e0f40099f6a15c99ad43ce859ceed9ad.jpg","/uploads/1759718306e0f40099f6a15c99ad43ce859ceed9ad.jpg","/uploads/1759718320e0f40099f6a15c99ad43ce859ceed9ad.jpg","/uploads/1759718331e0f40099f6a15c99ad43ce859ceed9ad.jpg","/uploads/1759718351e0f40099f6a15c99ad43ce859ceed9ad.jpg","/uploads/1759718364e0f40099f6a15c99ad43ce859ceed9ad.jpg","/uploads/1759718379e0f40099f6a15c99ad43ce859ceed9ad.jpg","/uploads/1759718395e0f40099f6a15c99ad43ce859ceed9ad.jpg","/uploads/1759718408e0f40099f6a15c99ad43ce859ceed9ad.jpg","/uploads/1759770359b70f0e78a7f5542e708afd8dbbbc2e3d.jpg","/uploads/1759770368975680b4a1ec4669f6a33758a23b08f7.pdf","/uploads/17597706365030506b082f22f884b27d341d36d24c.pdf","/uploads/1759771094e0f40099f6a15c99ad43ce859ceed9ad.jpg","/uploads/1759771170e0f40099f6a15c99ad43ce859ceed9ad.jpg","/uploads/1759771203e0f40099f6a15c99ad43ce859ceed9ad.jpg","/uploads/1759771225e0f40099f6a15c99ad43ce859ceed9ad.jpg","/uploads/17597712910b862ba33d5ea1581b862a92b8779eda.pdf","/uploads/1759771321e0f40099f6a15c99ad43ce859ceed9ad.jpg","/uploads/17597713300b862ba33d5ea1581b862a92b8779eda.pdf","/uploads/1759771356e0f40099f6a15c99ad43ce859ceed9ad.jpg","/uploads/17597713630b862ba33d5ea1581b862a92b8779eda.pdf","/uploads/1759771485e0f40099f6a15c99ad43ce859ceed9ad.jpg","/uploads/17597714923648e5ac575fbf5ee15fd9e6a51efc2d.pdf","/uploads/1759771516e0f40099f6a15c99ad43ce859ceed9ad.jpg","/uploads/17597715223648e5ac575fbf5ee15fd9e6a51efc2d.pdf","/uploads/1759771666e0f40099f6a15c99ad43ce859ceed9ad.jpg","/uploads/1759771696e0f40099f6a15c99ad43ce859ceed9ad.jpg","/uploads/1759771727e0f40099f6a15c99ad43ce859ceed9ad.jpg","/uploads/1759771759e0f40099f6a15c99ad43ce859ceed9ad.jpg","/uploads/17597718098d839ddb67b1fb25805f4b9c89d72b46.pdf","/uploads/1760059047ab26f30dfc67249522876d792fb8b2a9.jpg","/uploads/17600590882e8be91dc6fa27773926a215437f5a34.jpg","/uploads/1760059192c2a331b75f04b13fc396b046ddbfabfb.pdf","/uploads/17600596622e8be91dc6fa27773926a215437f5a34.jpg","/uploads/17600597337bdb84d996d9aca0926a3b09054a5749.pdf","/uploads/1760060316ac93f748453ead2da836c8aa209ec424.jpg","/uploads/1760060322f75a5b248d8acef549cb30ee3ab00682.jpg","/uploads/1760060386523d0dd4f74a995aadebc56ff69b724a.pdf","/uploads/1760061142abb52bcbc21c55d6dfc75024ed8fcc0f.jpg","/uploads/1760061174f1ed41bec6f37c6e1eec851d9912668e.pdf","/uploads/1760061214fad9e574b143c20d6849eb3c4ceb02bf.jpg","/uploads/1760061623431f2b710fdd854bc1a3f54582ae8364.jpg","/uploads/176006162908f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/1760061809ac92b898cc8a14157dd35afc05abcfc5.pdf","/uploads/1760061967431f2b710fdd854bc1a3f54582ae8364.jpg","/uploads/176006197308f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/1760062118ac92b898cc8a14157dd35afc05abcfc5.pdf","/uploads/1760062262363cc711784dd20e4c489d14ffc771d1.jpg","/uploads/1760062268c10d781df59c7a81d07c79fdc1bf6e09.jpg","/uploads/176006258008f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/176006261008f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/176006262508f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/176006264408f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/176006266508f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/176006268208f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/1760062774f6aeca890b3c9ccfe140202521677951.jpg","/uploads/176006278008f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/176006281408f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/176006284708f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/176006286308f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/176006288708f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/176006290308f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/176006292108f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/176006293808f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/176006295308f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/176006296808f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/176006298408f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/176006300208f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/176006301908f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/176006303308f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/176006304408f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/176006306108f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/176006307808f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/17600633716fbeade523a58f07f442ce12500bcffe.jpg","/uploads/1760063376c10d781df59c7a81d07c79fdc1bf6e09.jpg","/uploads/1760630331b70f0e78a7f5542e708afd8dbbbc2e3d.jpg","/uploads/17606303372db00a05dff60bf3c5ee9e4acedc754a.pdf","/uploads/1761187852d98e7361e7af615baa23de49be0d1cae.pdf","/uploads/1761187874d98e7361e7af615baa23de49be0d1cae.pdf","/uploads/17611880614f6796fa943907ffe9e749de98a6ca02.jpg","/uploads/17611882441c790dfed3c631e6c072b7f74dbeb99b.jpg","/uploads/1761188384d7be7d8c58200cba079212c1213c294e.jpg","/uploads/17611886697626cc732426f71f9ad4b6a1b772bfe5.jpg","/uploads/1761188766cf335dc0b8efe52af3524ed3b4a5157e.jpg","/uploads/17611888484d8a836e97883ad583f9edeb5ef3b684.jpg","/uploads/1761189224f2bb9dd073e72d4aeda73fded2f469e8.jpg","/uploads/17611893608f9ee627bdd1f74aa974610a3146e580.jpg","/uploads/1761189548e2af273101f63ceb022fda6599334c83.jpg","/uploads/176118968857b7d2c57291f006284ec26713319ff6.jpg","/uploads/17611898057a59c09f9db59e171bea963a0cdb1a89.jpg","/uploads/1761356456d3ebbf977c6bbdeed626dd84a5b84847.pdf","/uploads/176135657654760ae6acabc0ef75e43060c2a5ae4d.pdf","/uploads/1761357208fa539b8ef413d1091f3055cfc9c1f9a2.jpg","/uploads/176135721455e8df7ad0d2d75f8f617908dc5bc919.jpg","/uploads/176135734362e59423e65b813bce388e47a01a6be6.pdf","/uploads/176135784255e8df7ad0d2d75f8f617908dc5bc919.jpg","/uploads/176135798455e8df7ad0d2d75f8f617908dc5bc919.jpg","/uploads/176135868396fae8a912874012edbd525fafb28aee.jpg","/uploads/176135873696fae8a912874012edbd525fafb28aee.jpg","/uploads/176135876196fae8a912874012edbd525fafb28aee.jpg","/uploads/176135878696fae8a912874012edbd525fafb28aee.jpg","/uploads/176135881196fae8a912874012edbd525fafb28aee.jpg","/uploads/1761359073c04efa9415d724e75fed333bfdfab024.pdf","/uploads/1761359097c04efa9415d724e75fed333bfdfab024.pdf","/uploads/1761359116c04efa9415d724e75fed333bfdfab024.pdf","/uploads/1761359152c04efa9415d724e75fed333bfdfab024.pdf","/uploads/17614043595ac86c0d56f9ba3d1bd3e55150d9417c.pdf","/uploads/1761404520bf838c7cbd76ea9699180169b50c170a.jpg","/uploads/1761404553bf838c7cbd76ea9699180169b50c170a.jpg","/uploads/17614046545bb12e8933b780d70c8ef5528022fb6a.pdf","/uploads/1761404760bf838c7cbd76ea9699180169b50c170a.jpg","/uploads/17614048874b825351617203006ba17ea16e1270a5.pdf","/uploads/1761405040bf838c7cbd76ea9699180169b50c170a.jpg","/uploads/1761405093bf838c7cbd76ea9699180169b50c170a.jpg","/uploads/1761405111bf838c7cbd76ea9699180169b50c170a.jpg","/uploads/17614463061673c5840cee7a8eaa21f15c4b9bc8d7.jpeg","/uploads/1761446521a6bce6e090be6cfe73272709436f6d68.pdf","/uploads/17614466971673c5840cee7a8eaa21f15c4b9bc8d7.jpeg","/uploads/17614467281673c5840cee7a8eaa21f15c4b9bc8d7.jpeg","/uploads/17614467431673c5840cee7a8eaa21f15c4b9bc8d7.jpeg","/uploads/1761446798af5ecdeb0bbdeb0405c161c34a3eda46.pdf","/uploads/17614468871673c5840cee7a8eaa21f15c4b9bc8d7.jpeg","/uploads/17614469563a4ff193425aeea152ae1a621b034e4e.jpeg","/uploads/17614469913a4ff193425aeea152ae1a621b034e4e.jpeg","/uploads/17614470153a4ff193425aeea152ae1a621b034e4e.jpeg","/uploads/17614470371673c5840cee7a8eaa21f15c4b9bc8d7.jpeg","/uploads/1761447139161bcc44b01fea42c8899c8d70e3ab15.pdf","/uploads/17614471571673c5840cee7a8eaa21f15c4b9bc8d7.jpeg","/uploads/176144721063359ed4363a1bf58f506ac66092e13c.pdf","/uploads/17614472533a4ff193425aeea152ae1a621b034e4e.jpeg","/uploads/17614472893a4ff193425aeea152ae1a621b034e4e.jpeg","/uploads/17614473508fcf8a38f385498d877577dbdf0714f2.jpg","/uploads/17614473833a4ff193425aeea152ae1a621b034e4e.jpeg","/uploads/17614476213a4ff193425aeea152ae1a621b034e4e.jpeg","/uploads/17614476473a4ff193425aeea152ae1a621b034e4e.jpeg","/uploads/17614476868fcf8a38f385498d877577dbdf0714f2.jpg","/uploads/17614477053a4ff193425aeea152ae1a621b034e4e.jpeg","/uploads/17614477323a4ff193425aeea152ae1a621b034e4e.jpeg","/uploads/17614477553a4ff193425aeea152ae1a621b034e4e.jpeg","/uploads/17614477863a4ff193425aeea152ae1a621b034e4e.jpeg","/uploads/1761526466c025a729910cbe8048831b3ad977a77b.pdf","/uploads/1761526470ccd9e794d7f3301489ad88643748d1a2.jpg","/uploads/17615265551d1f8212c9d7281f05c522bae9c30a7d.jpg","/uploads/1761526659ef3957e671a2f4d4d11dd6b552515674.pdf","/uploads/17615267671d1f8212c9d7281f05c522bae9c30a7d.jpg","/uploads/1761526927b6a8c5aedc16cbe10f46ac9cce76367c.pdf","/uploads/1761527438b6a8c5aedc16cbe10f46ac9cce76367c.pdf","/uploads/176152772470dbe1c4e0114a07c95f6a0ebe8b256d.pdf","/uploads/1761527727b70f0e78a7f5542e708afd8dbbbc2e3d.jpg","/uploads/1761528059b70f0e78a7f5542e708afd8dbbbc2e3d.jpg","/uploads/1761528178bcbf18b49ee888c4e6b224ac74b21b9c.pdf","/uploads/1761528235b70f0e78a7f5542e708afd8dbbbc2e3d.jpg","/uploads/1761528259a0964cf9089ec36374caa10ca5aaa873.pdf","/uploads/1761528370a0964cf9089ec36374caa10ca5aaa873.pdf","/uploads/1761528375b70f0e78a7f5542e708afd8dbbbc2e3d.jpg","/uploads/1761618724d914fc621a29611ec13d39b88c17bb23.jpg","/uploads/17616187747b9ce9d61adca0b71dd94d1227861ea9.pdf","/uploads/1761618810d914fc621a29611ec13d39b88c17bb23.jpg","/uploads/17616188167b9ce9d61adca0b71dd94d1227861ea9.pdf","/uploads/1761619075dae1f3137c132490d7ee14c9c37c349a.jpeg","/uploads/1761619166d3937f27a4b6c47ce2d3db6c8036c19e.pdf","/uploads/1761619170dae1f3137c132490d7ee14c9c37c349a.jpeg","/uploads/1761619203d3937f27a4b6c47ce2d3db6c8036c19e.pdf","/uploads/1761619208dae1f3137c132490d7ee14c9c37c349a.jpeg","/uploads/1761619229dae1f3137c132490d7ee14c9c37c349a.jpeg","/uploads/176161934875303019d9c3890bd8ae6d490ff0169c.pdf","/uploads/1761619352dae1f3137c132490d7ee14c9c37c349a.jpeg","/uploads/1761619370dae1f3137c132490d7ee14c9c37c349a.jpeg","/uploads/176161937775303019d9c3890bd8ae6d490ff0169c.pdf","/uploads/1761619396dae1f3137c132490d7ee14c9c37c349a.jpeg","/uploads/176161940275303019d9c3890bd8ae6d490ff0169c.pdf","/uploads/1761619422d3937f27a4b6c47ce2d3db6c8036c19e.pdf","/uploads/17616195385028281abe9ba80548a6301864cd6f77.jpeg","/uploads/1761619544dae1f3137c132490d7ee14c9c37c349a.jpeg","/uploads/1761619621f7f3c786c1ffe14aef49b34916163307.pdf","/uploads/17616197828160d74cb5b8a8d8d0aef4b5ae2bf101.jpg","/uploads/1761619956b2acc78c89c79020e39bf09b2ce3ac7f.pdf","/uploads/17616199848160d74cb5b8a8d8d0aef4b5ae2bf101.jpg","/uploads/1761619992b2acc78c89c79020e39bf09b2ce3ac7f.pdf","/uploads/17616200088160d74cb5b8a8d8d0aef4b5ae2bf101.jpg","/uploads/1761620022b2acc78c89c79020e39bf09b2ce3ac7f.pdf","/uploads/1761621861955a0e6a8034f7b27c9cc023921237fa.pdf","/uploads/176162190189bfbe75a2565091679cbef33828622a.jpeg","/uploads/176162202489bfbe75a2565091679cbef33828622a.jpeg","/uploads/1761622037955a0e6a8034f7b27c9cc023921237fa.pdf","/uploads/176162205689bfbe75a2565091679cbef33828622a.jpeg","/uploads/1761622065955a0e6a8034f7b27c9cc023921237fa.pdf","/uploads/176162208789bfbe75a2565091679cbef33828622a.jpeg","/uploads/1761622096955a0e6a8034f7b27c9cc023921237fa.pdf","/uploads/176162211489bfbe75a2565091679cbef33828622a.jpeg","/uploads/1761622121955a0e6a8034f7b27c9cc023921237fa.pdf","/uploads/176162214289bfbe75a2565091679cbef33828622a.jpeg","/uploads/1761622149955a0e6a8034f7b27c9cc023921237fa.pdf","/uploads/176162217389bfbe75a2565091679cbef33828622a.jpeg","/uploads/1761622182955a0e6a8034f7b27c9cc023921237fa.pdf","/uploads/176162223089bfbe75a2565091679cbef33828622a.jpeg","/uploads/1761622239e79cb88f3a3f7659476879f1e21a00a3.pdf","/uploads/176162225689bfbe75a2565091679cbef33828622a.jpeg","/uploads/1761622265e79cb88f3a3f7659476879f1e21a00a3.pdf","/uploads/176162228189bfbe75a2565091679cbef33828622a.jpeg","/uploads/1761622291e79cb88f3a3f7659476879f1e21a00a3.pdf","/uploads/17617688633973e20b5bc03801e186e31c547a7519.pdf","/uploads/17617688813973e20b5bc03801e186e31c547a7519.pdf","/uploads/17617688953973e20b5bc03801e186e31c547a7519.pdf","/uploads/17617689073973e20b5bc03801e186e31c547a7519.pdf","/uploads/17617689193973e20b5bc03801e186e31c547a7519.pdf","/uploads/17617689923973e20b5bc03801e186e31c547a7519.pdf","/uploads/17617690053973e20b5bc03801e186e31c547a7519.pdf","/uploads/17617690203973e20b5bc03801e186e31c547a7519.pdf","/uploads/17617690313973e20b5bc03801e186e31c547a7519.pdf","/uploads/17621394150d7852857aaf7106febc03561024ef0f.jpg","/uploads/176213953669f8e222b3275c5266ea82d793cc4258.jpg","/uploads/176213958313ceb06497dbb890cbb48cbf2ef0d955.jpg","/uploads/176213969810263c9f06142faca2aca8c2c58f4e4b.pdf","/uploads/176213972213ceb06497dbb890cbb48cbf2ef0d955.jpg","/uploads/1762139861e6641c22fee28cd43b6b6f9a45aa1174.pdf","/uploads/176213989913ceb06497dbb890cbb48cbf2ef0d955.jpg","/uploads/176213993813ceb06497dbb890cbb48cbf2ef0d955.jpg","/uploads/176213996713ceb06497dbb890cbb48cbf2ef0d955.jpg","/uploads/1762140017ade0054369e832e1ed2efdca287b148b.pdf","/uploads/176214004313ceb06497dbb890cbb48cbf2ef0d955.jpg","/uploads/1762140253fbdd9e6247ab13c458ffbdbefb8e8939.pdf","/uploads/176214034334b56778793ed2da53a7b49e919fa5c8.pdf","/uploads/176214035213ceb06497dbb890cbb48cbf2ef0d955.jpg","/uploads/176214037013ceb06497dbb890cbb48cbf2ef0d955.jpg","/uploads/176214038913ceb06497dbb890cbb48cbf2ef0d955.jpg","/uploads/176214040713ceb06497dbb890cbb48cbf2ef0d955.jpg","/uploads/176214041334b56778793ed2da53a7b49e919fa5c8.pdf","/uploads/1762140467ccd9e794d7f3301489ad88643748d1a2.jpg","/uploads/176214048513ceb06497dbb890cbb48cbf2ef0d955.jpg","/uploads/1762140512ccd9e794d7f3301489ad88643748d1a2.jpg","/uploads/1762140534ccd9e794d7f3301489ad88643748d1a2.jpg","/uploads/176214063931ddc8e571d086261d2a36dbf84493c9.jpeg","/uploads/1762140646ccd9e794d7f3301489ad88643748d1a2.jpg","/uploads/1762140675ccd9e794d7f3301489ad88643748d1a2.jpg","/uploads/17621408227ad45090ce86f1c6cc50998a29455867.jpg","/uploads/1762140955ccd9e794d7f3301489ad88643748d1a2.jpg","/uploads/17621409727ad45090ce86f1c6cc50998a29455867.jpg","/uploads/176214104869f8e222b3275c5266ea82d793cc4258.jpg","/uploads/17621411898471f6fa25d1efb0b395f1db5fc73987.pdf","/uploads/1762141215ccd9e794d7f3301489ad88643748d1a2.jpg","/uploads/176214154017e69c174c59193a26c00bf89aefa1b1.pdf","/uploads/176214154608f62a7c4f67ef35265b96ce04e99733.jpg","/uploads/1762141618ccd9e794d7f3301489ad88643748d1a2.jpg","/uploads/17621416777ad45090ce86f1c6cc50998a29455867.jpg","/uploads/176214178033b5966722eb44782dae18e453af3aa5.pdf","/uploads/1762141914a34925b73ed678c14cfd33c6bbcaf17a.pdf","/uploads/1762141972ccd9e794d7f3301489ad88643748d1a2.jpg","/uploads/1762142125e6be72c82a2a02ff8cfb4b6b46c7ee03.jpg","/uploads/176214213169f8e222b3275c5266ea82d793cc4258.jpg","/uploads/1762142238a7165f9e2fe0bdb39c824ad549741a6b.pdf","/uploads/1762142286ccd9e794d7f3301489ad88643748d1a2.jpg","/uploads/17621423477ad45090ce86f1c6cc50998a29455867.jpg","/uploads/1762142370ccd9e794d7f3301489ad88643748d1a2.jpg","/uploads/176214241369f8e222b3275c5266ea82d793cc4258.jpg","/uploads/1762142435ccd9e794d7f3301489ad88643748d1a2.jpg","/uploads/176214249613ceb06497dbb890cbb48cbf2ef0d955.jpg","/uploads/1762142518ccd9e794d7f3301489ad88643748d1a2.jpg","/uploads/1762142840f9d241c1723252ceb8905b1da2ca5f70.jpeg","/uploads/1762142876f9d241c1723252ceb8905b1da2ca5f70.jpeg","/uploads/1762142908f9d241c1723252ceb8905b1da2ca5f70.jpeg","/uploads/17623096297ad45090ce86f1c6cc50998a29455867.jpg","/uploads/17623097087ad45090ce86f1c6cc50998a29455867.jpg","/uploads/176230978613ceb06497dbb890cbb48cbf2ef0d955.jpg","/uploads/17623098127ad45090ce86f1c6cc50998a29455867.jpg","/uploads/1762310009779bf63596101b7f1114c4abc4bbe978.jpg","/uploads/1762310026779bf63596101b7f1114c4abc4bbe978.jpg","/uploads/1762310060779bf63596101b7f1114c4abc4bbe978.jpg","/uploads/1762310254779bf63596101b7f1114c4abc4bbe978.jpg","/uploads/1762310495779bf63596101b7f1114c4abc4bbe978.jpg","/uploads/1762310544779bf63596101b7f1114c4abc4bbe978.jpg","/uploads/1762310593ccd9e794d7f3301489ad88643748d1a2.jpg","/uploads/1762310678ccd9e794d7f3301489ad88643748d1a2.jpg","/uploads/1762310707779bf63596101b7f1114c4abc4bbe978.jpg","/uploads/1762911980c98118ddd11c673725ad33775685949c.jpeg","/uploads/17629120403629ed62479848fc5a7068c88eb11899.pdf","/uploads/17629127583d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762912801ff7dd086096d4ef31c620d7c062e3b6a.pdf","/uploads/17629128343d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762912842a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629128603d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762912866a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629128783d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762912910a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/1762912928a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629129313d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/17629129483d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762912954a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629131363d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913146a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629131653d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913171a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629131843d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913191a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629132163d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913222a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629132313d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913237a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629132573d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913263a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/1762913300a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629133033d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/17629133283d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913334a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629133483d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913355374e29cdb7f1883c407a994088f3bb6a.pdf","/uploads/17629133713d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913377a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629134013d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913408a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629134203d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913426a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629134403d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913446a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629134603d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913466374e29cdb7f1883c407a994088f3bb6a.pdf","/uploads/17629135823d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913591a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629136093d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913618a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629136673d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913673a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629136903d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913696a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629137723d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913779a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629137943d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913801a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629138153d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913822a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629138513d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913857a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629138713d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913878a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629138943d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913899a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629139203d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762913926a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629141023d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762914110a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629141213d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762914126a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629141373d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762914144a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629141533d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762914161a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629141773d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762914187a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629142043d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762914211a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/17629142333d76052210cde50f7ac9d865eb79f3d9.jpeg","/uploads/1762914240a2526c39fdafffdf873d0fbc7a34a4c6.pdf","/uploads/1763475015af2755676f084a8c0e350968f88a99d0.jpg","/uploads/176347503969f8e222b3275c5266ea82d793cc4258.jpg","/uploads/17634752101e567904b4a8516ecff282d2bf933039.pdf","/uploads/176347563331692f521ae597719ee9f0114cf009fc.jpg","/uploads/1763475679f7f32768ec4057688d0fd60dc7d57c5e.jpg","/uploads/176347574131692f521ae597719ee9f0114cf009fc.jpg","/uploads/1763475750f7f32768ec4057688d0fd60dc7d57c5e.jpg","/uploads/17634759344fa66a58337aa77bf49048205df44740.jpg","/uploads/1763475939f7f32768ec4057688d0fd60dc7d57c5e.jpg","/uploads/176347624131692f521ae597719ee9f0114cf009fc.jpg","/uploads/1763476248f7f32768ec4057688d0fd60dc7d57c5e.jpg","/uploads/17634766614fa66a58337aa77bf49048205df44740.jpg","/uploads/1763476666f7f32768ec4057688d0fd60dc7d57c5e.jpg","/uploads/176347699657836577bc06490deecb4ccfdd9b63e1.jpg","/uploads/1763477001f7f32768ec4057688d0fd60dc7d57c5e.jpg","/uploads/17634770247b9ce9d61adca0b71dd94d1227861ea9.pdf","/uploads/1763477234e79cb88f3a3f7659476879f1e21a00a3.pdf","/uploads/176347740919765c5d22fdf302f98bb414b909b30b.jpg","/uploads/176347741989bfbe75a2565091679cbef33828622a.jpeg","/uploads/176478913828ba596dedc387558d4f0f1f99e5ba29.pdf","/uploads/176582588969ff5420f1bf6cd0f23148e94bf0c8de.pdf","/uploads/176598303994c392589f4f5e5e2ad776607ad4ded3.pdf","/uploads/176598305560cb220d24cdd992570fc41f52139866.jpg","/uploads/176598328194c392589f4f5e5e2ad776607ad4ded3.pdf","/uploads/176598337769ff5420f1bf6cd0f23148e94bf0c8de.pdf","/uploads/176598354769ff5420f1bf6cd0f23148e94bf0c8de.pdf","/uploads/176598374969ff5420f1bf6cd0f23148e94bf0c8de.pdf","/uploads/1768065081ee4532c38fe3a321ff567dfff6caed0b.jpg","/uploads/1769610921a3137ffcbf3be656bd2e930d7423945a.pdf","/uploads/1770015492a28d00e0e6f82ff1b5562c2f291db241.jpg","/uploads/1770015528ef4e45cce111b8f368bb018f4ee67e82.pdf","/uploads/1770015772c4b0fb8d642806ee2fe1f298a0d85113.jpg","/uploads/17700162207729924e411bcd6c129d6ec824fced1d.pdf","/uploads/1770016410b0372c06b314959e250f2d178e21ebdd.jpg","/uploads/177001641714324ce9857e2b2fd570d5fa40ac89c3.jpg","/uploads/1770016536c73737bfb02d0c13c6d63f97b4c727d6.pdf","/uploads/177001680763f97da51e7b25ad0cdaa10ca0ccd3c0.jpg","/uploads/1770016816336ffb3882556fde6eaaae8b5534ba97.jpg","/uploads/177001715769a482e03ab4205d6bcf8a7424cc5b78.jpg","/uploads/1770017162336ffb3882556fde6eaaae8b5534ba97.jpg","/uploads/17700172429bfd0a01f8448f0bbe3449bf21223206.pdf","/uploads/1770018617a1de276bd444fb769d1315ed361fe2c5.jpg","/uploads/1770018623786500f47c9f133218a4057e031f4abb.jpg","/uploads/1770018727a6959ad6e5caa42e582b1858cfd46094.pdf","/uploads/177001891444308941e7590502125f33c4d38af464.jpg","/uploads/1770018920336ffb3882556fde6eaaae8b5534ba97.jpg","/uploads/1770019134e9a285727ed84ae8a4ded9f00ca97879.jpg","/uploads/1770019140336ffb3882556fde6eaaae8b5534ba97.jpg","/uploads/1770019286545acff64264f3bd1c0b9fafe84e7e50.jpg","/uploads/1770019291336ffb3882556fde6eaaae8b5534ba97.jpg","/uploads/17700194243c605a77e82fb0facc456208cf47e991.jpg","/uploads/1770019430336ffb3882556fde6eaaae8b5534ba97.jpg","/uploads/1770019531e436343e1d0904b2ef827021481e0f26.jpg","/uploads/1770019537336ffb3882556fde6eaaae8b5534ba97.jpg","/uploads/1770019789c6486bfe7d41f295fe20f290db248e50.jpg","/uploads/1770019795336ffb3882556fde6eaaae8b5534ba97.jpg","/uploads/1770019836cea1da4a58ec19fafcb6f7a23bab90e2.pdf","/uploads/1770040408c0a64a7cab6986d1ea63c81b6431538d.jpg","/uploads/177004066026e6c6076ead286024b632551cfcb938.jpg","/uploads/17700407195a783c45f9d3ce2438eb5e84b8e8916b.pdf","/uploads/17700407431c27feb1aa7d662ccdd78a5e1d014a3b.jpg","/uploads/17700411055a783c45f9d3ce2438eb5e84b8e8916b.pdf","/uploads/17700411675c6b6ea696eef360bf7c2ff1a42a86cf.jpg","/uploads/17700411721c27feb1aa7d662ccdd78a5e1d014a3b.jpg","/uploads/17700422371bef34391e7df28ef19683826c5f46dd.jpg","/uploads/1770042319527073786802b304de5a774b6b4e9371.jpg","/uploads/1770042588ae28cdc4e5d7d07e5a3ab449f47a047b.jpg","/uploads/1770042592527073786802b304de5a774b6b4e9371.jpg","/uploads/17713669898aac35cd2a33f9d03854b7efb06df545.jpg","/uploads/177136701443898af0c53873cafe27ff5196694ecb.jpg","/uploads/17713673000ebb563131f50213212b9021f77c2a2f.avif","/uploads/177136730543898af0c53873cafe27ff5196694ecb.jpg","/uploads/17713676465f25e8982a4c271b754e5ef02e4d5b66.jpg","/uploads/1771367655527073786802b304de5a774b6b4e9371.jpg","/uploads/1771368638a5bd3075b2a8ec5add2b64f3f9bb3fd7.jpg","/uploads/17713686879fc4784d9beff73fe692dcb5ab3c3f5f.jpg","/uploads/17713687559fc4784d9beff73fe692dcb5ab3c3f5f.jpg","/uploads/17713687809fc4784d9beff73fe692dcb5ab3c3f5f.jpg","/uploads/17713687999fc4784d9beff73fe692dcb5ab3c3f5f.jpg","/uploads/17713688239fc4784d9beff73fe692dcb5ab3c3f5f.jpg","/uploads/17713688929fc4784d9beff73fe692dcb5ab3c3f5f.jpg","/uploads/17713689139fc4784d9beff73fe692dcb5ab3c3f5f.jpg","/uploads/17713689609fc4784d9beff73fe692dcb5ab3c3f5f.jpg","/uploads/17713689859fc4784d9beff73fe692dcb5ab3c3f5f.jpg","/uploads/17713690209fc4784d9beff73fe692dcb5ab3c3f5f.jpg","/uploads/17713690349fc4784d9beff73fe692dcb5ab3c3f5f.jpg","/uploads/17713690889fc4784d9beff73fe692dcb5ab3c3f5f.jpg","/uploads/177145492993f59a92221ed2707340bf6c969a8752.pdf","/uploads/1771454937786500f47c9f133218a4057e031f4abb.jpg","/uploads/177427178522827fb4cfa606c6f5cca826efc06c89.jpeg","/uploads/177427179298a70e6edad3bb5ddae659a9fa9eeb08.jpg","/uploads/177427185942d0c46366cac1811adc7331b9075ef6.pdf","/uploads/177427204127e3be4dbcb0678836dce98f956ff5c9.jpg","/uploads/17742720467f8576ced920f331274e8c9581e174c3.jpg","/uploads/17777256700d2f2fc6ce995df29966df93ba256ccc.jpg","/uploads/17777257043fe99d01e5abfcb7957bfbe8aadb51af.jpg","/uploads/17777257779d6529498b6ca41d621165ca63716d83.jpg","/uploads/17777261672397074a862f86d214344f56adf2ec2e.jpg","/uploads/1777726167e32db693189000e9416b3f3c7f0233cd.jpg","/uploads/17777262169d6529498b6ca41d621165ca63716d83.jpg","/uploads/17777271545f1d1ca0a1c412bf38b049df05be1966.jpg","/uploads/17778559109d6529498b6ca41d621165ca63716d83.jpg","/uploads/177785598515883244f9d19edcd0bee367b07f5780.pdf","/uploads/17791447125e672ec0c8041ce22bd8c02d48091756.jpg","/uploads/17793241940e5670bbdee15e5b00beac8c81ffec4c.jpg","/uploads/17793242033a95c055a1eeab39b518e54a9f6c847e.jpg","/uploads/177932442470b5fc90b7a33b1bcbe14446e56b8298.pdf","/uploads/17793244693a95c055a1eeab39b518e54a9f6c847e.jpg","/uploads/177932447770b5fc90b7a33b1bcbe14446e56b8298.pdf","/uploads/177932453870b5fc90b7a33b1bcbe14446e56b8298.pdf","/uploads/17793246453a95c055a1eeab39b518e54a9f6c847e.jpg","/uploads/17793297312b248ee3cb572aa32597fd53e93ff87b.jpg","/uploads/17793297366dd79e47c7dd9d6d8644fd6943211b11.jpg","/uploads/1779329794a3d699c27839b67e79b53e7fdbed3072.pdf","/uploads/177933254879428ed19b9b3b4e1980bd3b8d9b7233.jpg","/uploads/177933255352f56fa3d83119677949dd7e5ab3806a.jpg","/uploads/177933294999c45b891805fc635ab211d459f30ed8.webp","/uploads/1779333338728217c512bad5bb94a1ff1067d6754c.jpg","/uploads/17793334841c62ff63c25b6293858565c65edb5868.png","/uploads/1779333490728217c512bad5bb94a1ff1067d6754c.jpg","/uploads/1779333495f68cc5d2d5bc5d033404160baf5268cf.pdf","/uploads/1779334478f68cc5d2d5bc5d033404160baf5268cf.pdf","/uploads/17793346690f3f61fe1e26cbf493aa0bd8f693b3eb.jpg","/uploads/1779334675728217c512bad5bb94a1ff1067d6754c.jpg","/uploads/17793347490f3f61fe1e26cbf493aa0bd8f693b3eb.jpg","/uploads/1779334754728217c512bad5bb94a1ff1067d6754c.jpg","/uploads/1779334758f68cc5d2d5bc5d033404160baf5268cf.pdf","/uploads/17793348451c62ff63c25b6293858565c65edb5868.png","/uploads/1779334849728217c512bad5bb94a1ff1067d6754c.jpg","/uploads/1779334853f68cc5d2d5bc5d033404160baf5268cf.pdf","/uploads/1779335044cbeba3859785cbfc6fc487b0c9223d88.jpg","/uploads/1779335050728217c512bad5bb94a1ff1067d6754c.jpg","/uploads/1779335056f68cc5d2d5bc5d033404160baf5268cf.pdf","/uploads/1779335079cbeba3859785cbfc6fc487b0c9223d88.jpg","/uploads/1779335085728217c512bad5bb94a1ff1067d6754c.jpg","/uploads/1779335089f68cc5d2d5bc5d033404160baf5268cf.pdf","/uploads/17793354225d48abe4160e41c3e13bd5f6856f0a66.jpg","/uploads/1780364722610395c43e56b0d883222d51130d7b09.jpeg","/uploads/1780365366a603701f1310067fe884d53d8eac3413.pdf","/uploads/1780365512a603701f1310067fe884d53d8eac3413.pdf","/uploads/17803655305aeae41fbe7c2081bf41bf35cf78e833.png","/uploads/1780365535610395c43e56b0d883222d51130d7b09.jpeg","/uploads/1780367817d3c0c19d31ef1fa0522c1650b8cff16f.pdf","/uploads/178036814207c5cabe45bfa473b42d92bef701f37f.jpg","/uploads/1780368153610395c43e56b0d883222d51130d7b09.jpeg","/uploads/1780368263d3c0c19d31ef1fa0522c1650b8cff16f.pdf","/uploads/178036826907c5cabe45bfa473b42d92bef701f37f.jpg","/uploads/1780368274610395c43e56b0d883222d51130d7b09.jpeg","/uploads/178036852607c5cabe45bfa473b42d92bef701f37f.jpg","/uploads/1780368531610395c43e56b0d883222d51130d7b09.jpeg","/uploads/1780368538d3c0c19d31ef1fa0522c1650b8cff16f.pdf","/uploads/178037072107c5cabe45bfa473b42d92bef701f37f.jpg","/uploads/1780370726610395c43e56b0d883222d51130d7b09.jpeg","/uploads/1780370732d3c0c19d31ef1fa0522c1650b8cff16f.pdf","/uploads/1780426913091bc4319e1fe751990df118be436ae2.jpg","/uploads/1780427078e67d211900c64c6978726837f30c4d9d.jpg","/uploads/17804327137a6daa130d3c432eda4cb1a2971fd48b.jpg","/uploads/1780433306eb2bd1ab38133096797042bcc2060816.jpg","/uploads/178043331396b11c45f1bdea789c0c23bbab70105b.jpg","/uploads/1780439001ec8d637d4385654d9fa8aef99c6f1ae4.jpg","/uploads/17804392094be3f30e5efa0c930343c8bf2910c72d.pdf","/uploads/1780439380ec8d637d4385654d9fa8aef99c6f1ae4.jpg","/uploads/1780439448efe4be2f242c1a431ad4741cbc706a34.pdf","/uploads/17804405342a9ff5484f878d60ad419ebb276a2f5d.jpg","/uploads/1780440585a790fec055df3ad03b2dcf7e9c4d2040.jpg","/uploads/1781498045e8fc897eb6d1ed1873113ec367e91db5.pdf","/uploads/1781498102e8fc897eb6d1ed1873113ec367e91db5.pdf","/uploads/17814982397fdc1a630c238af0815181f9faa190f5.jpg","/uploads/1781498247150d6cbf825741379318cc069169ddc6.jpg","/uploads/1781498526b9dd11cfc8495f6dd92bbee09dabab2c.pdf","/uploads/178149855055ccf27d26d7b23839986b6ae2e447ab.jpg","/uploads/1781498555150d6cbf825741379318cc069169ddc6.jpg","/uploads/17814989445c642ec854a6a92a56d7ebf0b9648eea.jpg","/uploads/1781498956f87605855a0198c4d366317645ec80ea.jpg","/uploads/17814989805a783c45f9d3ce2438eb5e84b8e8916b.pdf","/_astro/global.UuHrztoz.css"],"buildFormat":"directory","checkOrigin":true,"actionBodySizeLimit":1048576,"serverIslandBodySizeLimit":1048576,"allowedDomains":[],"key":"SvGXfUkIkb3Wqt6JwDyzbKN01nWlJEQIoIiDapb586M=","image":{},"devToolbar":{"enabled":false,"debugInfoOutput":""},"logLevel":"info","shouldInjectCspMetaTags":false}));
					const manifestRoutes = _manifest.routes;
					
					const manifest = Object.assign(_manifest, {
					  renderers,
					  actions: () => import('./noop-entrypoint_BOlrdqWF.mjs'),
					  middleware: () => import('../virtual_astro_middleware.mjs'),
					  sessionDriver: () => import('./_virtual_astro_session-driver_DYx9Bb3p.mjs'),
					  
					  serverIslandMappings: () => import('./_virtual_astro_server-island-manifest_CQQ1F5PF.mjs'),
					  routes: manifestRoutes,
					  pageMap,
					});

const createApp$1 = ({ streaming } = {}) => {
  const app = new App(manifest, streaming);
  app.setFetchHandler(fetchable);
  return app;
};

const createApp = createApp$1;

function getFirstForwardedValue(multiValueHeader) {
  return multiValueHeader?.toString()?.split(",").map((e) => e.trim())?.[0];
}
const IP_RE = /^[0-9a-fA-F.:]{1,45}$/;
function isValidIpAddress(value) {
  return IP_RE.test(value);
}
function getValidatedIpFromHeader(headerValue) {
  const raw = getFirstForwardedValue(headerValue);
  if (raw && isValidIpAddress(raw)) {
    return raw;
  }
  return void 0;
}
function getClientIpAddress(request) {
  return getValidatedIpFromHeader(request.headers.get("x-forwarded-for"));
}

const app = createApp();
var entrypoint_default = {
  async fetch(request) {
    const url = new URL(request.url);
    const middlewareSecretHeader = request.headers.get(ASTRO_MIDDLEWARE_SECRET_HEADER);
    const hasValidMiddlewareSecret = middlewareSecretHeader === middlewareSecret;
    let realPath = void 0;
    if (hasValidMiddlewareSecret) {
      realPath = request.headers.get(ASTRO_PATH_HEADER);
    } else if (request.headers.get("x-vercel-isr") === "1") {
      realPath = url.searchParams.get(ASTRO_PATH_PARAM);
    }
    if (typeof realPath === "string") {
      url.pathname = realPath;
      request = new Request(url.toString(), {
        method: request.method,
        headers: request.headers,
        ...request.body ? { body: request.body, duplex: "half" } : {}
      });
    }
    const routeData = app.match(request);
    let locals = {};
    const astroLocalsHeader = request.headers.get(ASTRO_LOCALS_HEADER);
    if (astroLocalsHeader) {
      if (!hasValidMiddlewareSecret) {
        return new Response("Forbidden", { status: 403 });
      }
      locals = JSON.parse(astroLocalsHeader);
    }
    if (hasValidMiddlewareSecret) {
      request.headers.delete(ASTRO_MIDDLEWARE_SECRET_HEADER);
    }
    const response = await app.render(request, {
      routeData,
      clientAddress: getClientIpAddress(request),
      locals
    });
    if (app.setCookieHeaders) {
      for (const setCookieHeader of app.setCookieHeaders(response)) {
        response.headers.append("Set-Cookie", setCookieHeader);
      }
    }
    return response;
  }
};

export { AstroError as A, entrypoint_default as B, ExpectedImage as E, FailedToFetchRemoteImageDimensions as F, IncompatibleDescriptorOptions as I, LocalImageUsedWrongly as L, MissingImageDimension as M, NoImageMetadata as N, RemoteImageNotAllowed as R, UnsupportedImageFormat as U, types as a, isRemotePath as b, UnsupportedImageConversion as c, InvalidImageService as d, ExpectedImageOptions as e, ExpectedNotESMImage as f, ImageMissingAlt as g, addAttribute as h, isRemoteAllowed as i, joinPaths as j, renderTemplate as k, FontFamilyNotFound as l, maybeRenderHead as m, MissingGetFontFileRequestUrl as n, renderComponent as o, Fragment as p, renderHead as q, removeQueryString as r, spreadAttributes as s, typeHandlers as t, unescapeHTML as u, renderSlot as v, InvalidComponentArgs as w, createRenderInstruction as x, defineScriptVars as y, MissingSharp as z };
