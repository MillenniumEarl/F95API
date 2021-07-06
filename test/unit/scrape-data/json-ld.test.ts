// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public module from npm
import { expect } from "chai";
import cheerio from "cheerio";

// Modules from file
import { getJSONLD } from "../../../src/scripts/scrape-data/json-ld";

export function suite(): void {
  it("Extract JSON+LD data from HTML", function () {
    // Arrange
    const html = `
    <div id='container'>
        <script type="application/ld+json">
        {
          "@context": "http://schema.org/",
          "@type": "Book",
          "name": "Thread title",
          "description": "Thread description",
          "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5",
              "bestRating": "5",
              "ratingCount": "1"
          }
        }
        </script>
    </div>`;
    const $ = cheerio.load(html);
    const node = $("#container");

    // Act
    const jsonld = getJSONLD(node);

    // Assert
    expect(jsonld["@type"]).to.be.equal("Book");
    expect(jsonld["aggregateRating"]["ratingValue"]).to.be.equal("5");
  });
}
