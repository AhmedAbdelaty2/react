/**
 * Copyright 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails react-core
*/

'use strict';

import Container from 'components/Container';
import Flex from 'components/Flex';
import MarkdownHeader from 'components/MarkdownHeader';
import NavigationFooter from 'templates/components/NavigationFooter';
import {StickyContainer} from 'react-sticky';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import StickySidebar from 'components/StickySidebar';
import findSectionForPath from 'utils/findSectionForPath';
import {sharedStyles} from 'theme';

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

// HACK: copied from 'installation.md'
// TODO: clean this up.
function setSelected(value) {
  var tabs = document.querySelectorAll('li[role="tab"]');
  for (var i = 0; i < tabs.length; ++i) {
    var tab = tabs[i];
    if (tab.className === 'button-' + value) {
      tabs[i].setAttribute('aria-selected', 'true');
      tabs[i].setAttribute('tabindex', '0');
    } else {
      tabs[i].setAttribute('aria-selected', 'false');
      tabs[i].setAttribute('tabindex', '-1');
    }
  }
}

function keyToggle(e, value, prevTab, nextTab) {
  // left arrow <-
  if (e.keyCode === 37) {
    document.getElementById(prevTab).focus();
    display('target', prevTab);
  }
  // right arrow ->
  if (e.keyCode === 39) {
    document.getElementById(nextTab).focus();
    display('target', nextTab);
  }
}

function display(type, value) {
  setSelected(value);
  var container = document.getElementsByTagName('section')[0].parentNode
    .parentNode;
  container.className =
    'display-' +
    type +
    '-' +
    value +
    ' ' +
    container.className.replace(RegExp('display-' + type + '-[a-z]+ ?'), '');
}

var foundHash = false;
function selectTabForHashLink() {
  var hashLinks = document.querySelectorAll('a.anchor');
  for (var i = 0; i < hashLinks.length && !foundHash; ++i) {
    if (hashLinks[i].hash === window.location.hash) {
      var parent = hashLinks[i].parentElement;
      while (parent) {
        if (parent.tagName === 'SECTION') {
          var target = null;
          if (parent.className.indexOf('fiddle') > -1) {
            target = 'fiddle';
          } else if (parent.className.indexOf('newapp') > -1) {
            target = 'newapp';
          } else if (parent.className.indexOf('existingapp') > -1) {
            target = 'existingapp';
          } else {
            break; // assume we don't have anything.
          }
          display('target', target);
          foundHash = true;
          break;
        }
        parent = parent.parentElement;
      }
    }
  }
}

// HACK Expose toggle functions global for markup-deifned event handlers.
// Don't acceess the 'window' object without checking first though,
// Because it would break the (Node only) Gatsby build step.
if (typeof window !== 'undefined') {
  window.keyToggle = keyToggle;
  window.display = display;
}

class InstallationPage extends Component {
  componentDidMount() {
    // If we are coming to the page with a hash in it (i.e. from a search, for example), try to get
    // us as close as possible to the correct platform and dev os using the hashtag and section walk up.
    if (
      this.props.location.hash !== '' &&
      this.props.location.hash !== 'content'
    ) {
      // content is default
      // Hash links are added a bit later so we wait for them.
      this.props.addEventListener('DOMContentLoaded', selectTabForHashLink);
    }
    display('target', 'fiddle');
  }

  render() {
    const {data, location} = this.props;
    const {markdownRemark} = data;

    return (
      <Flex
        direction="column"
        grow="1"
        shrink="0"
        halign="stretch"
        css={{
          width: '100%',
          flex: '1 0 auto',
          position: 'relative',
          zIndex: 0,
        }}>
        <div css={{flex: '1 0 auto'}}>
          <Container>
            <StickyContainer
              css={{
                display: 'flex',
              }}>
              <Flex type="article" direction="column" grow="1" halign="stretch">
                <MarkdownHeader title={markdownRemark.frontmatter.title} />
                <div
                  css={[
                    sharedStyles.markdown,
                    {
                      marginTop: 65,
                      marginBottom: 120,
                    },
                  ]}
                  dangerouslySetInnerHTML={{__html: markdownRemark.html}}
                />
              </Flex>

              <div
                css={{
                  flex: '0 0 200px',
                  marginLeft: 'calc(9% + 40px)',
                }}>
                <StickySidebar
                  defaultActiveSection={
                    location != null
                      ? findSectionForPath(location.pathname, sectionList)
                      : null
                  }
                  location={location}
                  sectionList={sectionList}
                />
              </div>
            </StickyContainer>
          </Container>
        </div>

        {/* TODO Read prev/next from index map, not this way */}
        <NavigationFooter
          next={markdownRemark.frontmatter.next}
          prev={markdownRemark.frontmatter.prev}
        />
      </Flex>
    );
  }
}

InstallationPage.propTypes = {
  data: PropTypes.shape({markdownRemark: PropTypes.object.isRequired})
    .isRequired,
};

// eslint-disable-next-line no-undef
export const pageQuery = graphql`
  query InstallationMarkdown($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        next
        prev
      }
    }
  }
`;

export default InstallationPage;
