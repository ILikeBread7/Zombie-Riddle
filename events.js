class Events {


  /**
   * @param {...string} eventTypes
   */
  static registerResize(...eventTypes) {
    eventTypes.forEach(type => {
      window.addEventListener(type, () => this._resize());
    });
  }

  static _resize() {
    const container = document.getElementById('container');
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const dimensions = this._calculateMaxDimensions(viewportWidth, viewportHeight);
   
    const top = Math.floor((viewportHeight - dimensions.height) / 2);
    const left = Math.floor((viewportWidth - dimensions.width) / 2);

    container.style.top = `${top}px`;
    container.style.left = `${left}px`;
    container.style.transform = `scale(${dimensions.factor})`;

    Screen.factor = dimensions.factor;
    Screen.top = top;
    Screen.left = left;
  }

  /**
   * 
   * @param {number} viewportWidth 
   * @param {number} viewportHeight 
   * @returns { { width: number, height: number, factor: number } }
   */
  static _calculateMaxDimensions(viewportWidth, viewportHeight) {
    const dimensionsByWidth = this._calculateMaxDimensionsByWidth(viewportWidth);
    const dimensionsByHeight = this._calculateMaxDimensionsByHeight(viewportHeight);
    return dimensionsByWidth.factor < dimensionsByHeight.factor ? dimensionsByWidth : dimensionsByHeight;
  }

  /**
   * 
   * @param {number} viewportWidth 
   * @returns { { width: number, height: number, factor: number } }
   */
  static _calculateMaxDimensionsByWidth(viewportWidth) {
    const factor = viewportWidth / WIDTH;
    return { width: viewportWidth,  height: HEIGHT * factor, factor };
  }

  /**
   * 
   * @param {number} viewportHeight 
   * @returns { { width: number, height: number, factor: number } }
   */
  static _calculateMaxDimensionsByHeight(viewportHeight) {
    const factor = viewportHeight / HEIGHT;
    return { width: WIDTH * factor,  height: viewportHeight, factor };
  }
};

Events.registerResize('resize');
Events._resize();