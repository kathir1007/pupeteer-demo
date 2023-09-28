export async function autoFormFilling(page, selector, value) {
    const element = await page.$(selector);
    if (element) {
      const tagName = await element.evaluate(node => node.tagName);
      console.log('inputType is',tagName);
      switch (tagName) {
        case 'INPUT':
          const inputType = await element.evaluate(node => node.type);
          console.log('inputType is',inputType);
          switch (inputType) {
            case 'checkbox':
              await element.click();
              break;
            case 'radio':
              await element.click();
              break;
            case 'date':
              await element.type(value);
              break;
            case 'time':
              await element.type(value);
              break;
            case 'text':
                await element.type(value);
                break;
            default:
              await element.type(value);
              break;
          }
          break;
        case 'SELECT':
          await element.select(value);
          break;
        case 'BUTTON':
          await element.evaluate(b => b.click());
          break;
        default:
          console.log(`Element ${selector} not supported`);
          break;
      }
    } else {
      console.log(`Element ${selector} not found`);
    }
  }
