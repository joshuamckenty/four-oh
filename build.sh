#!/bin/sh -x

# zip -9 -ur fouroh.xpi chrome components defaults install.rdf chrome.manifest -x \*/.\* -x xptgen
#zip -9 -ur googazon.xpi chrome defaults install.rdf chrome.manifest -x \*/.\* -x xptgen
#cp install.amo.rdf install.rdf
cp install.private.rdf install.rdf
zip -9 -ur fouroh.xpi chrome defaults install.rdf chrome.manifest -x \*/.\* -x xptgen
rm install.rdf