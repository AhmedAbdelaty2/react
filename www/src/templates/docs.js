/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
*/

'use strict';

import MarkdownPage from 'components/MarkdownPage';
import PropTypes from 'prop-types';
import React from 'react';

import sectionListA from '../../../docs/_data/nav_docs.yml';
import sectionListB from '../../../docs/_data/nav_contributing.yml';

const sectionList = sectionListA
  .map(item => {
    item.directory = 'docs';
    return item;
  })
  .concat(
    sectionListB.map(item => {
      item.directory = 'contributing';
      return item;
    }),
  );

const Docs = ({data, location}) => (
  <MarkdownPage
    location={location}
    markdownRemark={data.markdownRemark}
    sectionList={sectionList}
    titlePostfix=" - React"
  />
);

Docs.propTypes = {
  data: PropTypes.object.isRequired,
};

// eslint-disable-next-line no-undef
export const pageQuery = graphql`
  query TemplateDocsMarkdown($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        next
        prev
      }
      fields {
        path
      }
    }
  }
`;

export default Docs;
