/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessLoader,
  HarnessPredicate,
  ContentContainerComponentHarness,
  parallel,
} from '@angular/cdk/testing';
import {BaseListItemHarnessFilters, SubheaderHarnessFilters} from './list-harness-filters';

const iconSelector = '.mat-list-icon';
const avatarSelector = '.mat-list-avatar';

/**
 * Gets a `HarnessPredicate` that applies the given `BaseListItemHarnessFilters` to the given
 * list item harness.
 * @template H The type of list item harness to create a predicate for.
 * @param harnessType A constructor for a list item harness.
 * @param options An instance of `BaseListItemHarnessFilters` to apply.
 * @return A `HarnessPredicate` for the given harness type with the given options applied.
 */
export function getListItemPredicate<H extends MatListItemHarnessBase>(
  harnessType: ComponentHarnessConstructor<H>,
  options: BaseListItemHarnessFilters,
): HarnessPredicate<H> {
  return new HarnessPredicate(harnessType, options).addOption(
    'text',
    options.text,
    (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text),
  );
}

/** Harness for interacting with a list subheader. */
export class MatSubheaderHarness extends ComponentHarness {
  static hostSelector = '.mat-subheader';

  static with(options: SubheaderHarnessFilters = {}): HarnessPredicate<MatSubheaderHarness> {
    return new HarnessPredicate(MatSubheaderHarness, options).addOption(
      'text',
      options.text,
      (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text),
    );
  }

  /** Gets the full text content of the list item (including text from any font icons). */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }
}

/** Selectors for the various list item sections that may contain user content. */
export const enum MatListItemSection {
  CONTENT = '.mat-list-item-content',
  // TODO(mmalerba): consider adding sections for leading/trailing icons.
}

/**
 * Shared behavior among the harnesses for the various `MatListItem` flavors.
 * @docs-private
 */
export abstract class MatListItemHarnessBase extends ContentContainerComponentHarness<MatListItemSection> {
  private _lines = this.locatorForAll('.mat-line');
  private _avatar = this.locatorForOptional(avatarSelector);
  private _icon = this.locatorForOptional(iconSelector);

  /** Gets the full text content of the list item. */
  async getText(): Promise<string> {
    return (await this.host()).text({exclude: `${iconSelector}, ${avatarSelector}`});
  }

  /** Gets the lines of text (`mat-line` elements) in this nav list item. */
  async getLinesText(): Promise<string[]> {
    const lines = await this._lines();
    return parallel(() => lines.map(l => l.text()));
  }

  /** Whether this list item has an avatar. */
  async hasAvatar(): Promise<boolean> {
    return !!(await this._avatar());
  }

  /** Whether this list item has an icon. */
  async hasIcon(): Promise<boolean> {
    return !!(await this._icon());
  }

  /**
   * Gets a `HarnessLoader` used to get harnesses within the list item's content.
   * @deprecated Use `getChildLoader(MatListItemSection.CONTENT)` or `getHarness` instead.
   * @breaking-change 12.0.0
   */
  async getHarnessLoaderForContent(): Promise<HarnessLoader> {
    return this.getChildLoader(MatListItemSection.CONTENT);
  }
}
