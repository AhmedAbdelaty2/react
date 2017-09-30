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
import Link from 'gatsby-link';
import PropTypes from 'prop-types';
import React from 'react';
import {colors, fonts, media} from 'theme';

const NavigationFooter = ({next, prev}) => (
  <div
    css={{
      background: colors.dark,
      color: colors.white,
      paddingTop: 50,
      paddingBottom: 50,
    }}>
    <Container
      cssProps={{
        [media.size('sidebarFixedNarrowFooter')]: {
          maxWidth: 800,
          paddingLeft: 0,
          paddingRight: 0,
        },
      }}>
      <Flex
        type="ul"
        halign="space-between"
        css={{
          [media.between('small', 'medium')]: {
            paddingRight: 240,
          },

          [media.between('large', 'largerSidebar')]: {
            paddingRight: 280,
          },

          [media.between('largerSidebar', 'sidebarFixed', true)]: {
            paddingRight: 380,
          },
        }}>
        <Flex basis="50%" type="li">
          {prev &&
            <div>
              <SecondaryLabel>Previous article</SecondaryLabel>
              <div
                css={{
                  paddingTop: 10,
                }}>
                <PrimaryLink to={prev}>
                  {linkToTitle(prev)}
                </PrimaryLink>
              </div>
            </div>}
        </Flex>
        {next &&
          <Flex
            halign="flex-end"
            basis="50%"
            type="li"
            css={{
              textAlign: 'right',
            }}>
            <div>
              <SecondaryLabel>Next article</SecondaryLabel>
              <div
                css={{
                  paddingTop: 10,
                }}>
                <PrimaryLink to={next}>
                  {linkToTitle(next)}
                </PrimaryLink>
              </div>
            </div>
          </Flex>}
      </Flex>
    </Container>
  </div>
);

NavigationFooter.propTypes = {
  next: PropTypes.string,
  prev: PropTypes.string,
};

export default NavigationFooter;

const linkToTitle = link => link.replace(/-/g, ' ').replace('.html', '');

const PrimaryLink = ({children, to}) => (
  <Link
    css={{
      display: 'inline',
      textTransform: 'capitalize',
      borderColor: colors.subtle,
      transition: 'border-color 0.2s ease',
      fontSize: 30,
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',

      [media.lessThan('large')]: {
        fontSize: 24,
      },
      [media.size('xsmall')]: {
        fontSize: 16,
      },
      ':hover': {
        borderColor: colors.white,
      },
    }}
    to={to}>
    {children}
  </Link>
);

const SecondaryLabel = ({children}) => (
  <div
    css={{
      color: colors.brand,
      ...fonts.small,
    }}>
    {children}
  </div>
);
