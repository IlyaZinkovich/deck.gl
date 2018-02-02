import Viewport from '../viewports/viewport';
import {parsePosition, getPosition} from '../utils/positions';
import assert from 'assert';

export default class View {
  constructor(props) {
    const {
      id = null,

      // Window width/height in pixels (for pixel projection)
      x = 0,
      y = 0,
      width = '100%',
      height = '100%',

      // Viewport Type
      type = Viewport, // TODO - default to WebMercator?

      // Viewport Options
      viewMatrix, // view matrix
      projectionMatrix = null, // Projection matrix
      fovy = 75, // Perspective projection parameters, used if projectionMatrix not supplied
      near = 0.1, // Distance of near clipping plane
      far = 1000, // Distance of far clipping plane
      modelMatrix = null, // A model matrix to be applied to position, to match the layer props API

      // A View can be a wrapper for a viewport instance
      viewportInstance = null
    } = props;

    assert(!viewportInstance || viewportInstance instanceof Viewport);
    this.viewportInstance = viewportInstance;

    // Id
    this.id = id || this.constructor.displayName || 'view';
    this.type = type;

    // Extents
    this._initExtents({x, y, width, height});

    this.viewportOpts = {
      viewMatrix,
      projectionMatrix,
      fovy,
      near,
      far,
      modelMatrix
    };

    // Bind methods for easy access
    this.equals = this.equals.bind(this);

    Object.seal(this);
  }

  equals(newView) {
    if (newView === this) {
      return true;
    }
    // If a viewportInstance is supplied, it is the only thing that is used
    // `View` hiearchy supports an `equals` method
    if (newView.viewportInstance) {
      return this.viewport && this.viewport.equals(newView.viewportInstance);
    }
    // TODO - implement deep equal on view descriptors
    return false;
  }

  // Build a `Viewport` from a view descriptor
  // TODO - add support for autosizing viewports using width and height
  makeViewport({width, height, viewState}) {
    if (this.viewportInstance) {
      return this.viewportInstance;
    }

    // Get the type of the viewport
    const {type: ViewportType} = this;

    // Resolve relative viewport dimensions
    const viewportDimensions = this._getDimensions({width, height});

    // Create the viewport, giving preference to view state in `viewState`
    return new ViewportType(Object.assign({}, this, viewportDimensions, viewState));
  }

  // Support for relative viewport dimensions (e.g {y: '50%', height: '50%'})
  _getDimensions({width, height}) {
    return {
      x: getPosition(this._x, width),
      y: getPosition(this._y, height),
      width: getPosition(this._width, width),
      height: getPosition(this._height, height)
    };
  }

  // Support for relative viewport dimensions (e.g {y: '50%', height: '50%'})
  _initExtents({x, y, width, height}) {
    this._x = parsePosition(x);
    this._y = parsePosition(y);
    this._width = parsePosition(width);
    this._height = parsePosition(height);
  }
}
