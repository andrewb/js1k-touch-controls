(function () {
  function isInBounds(el, { x, y }) {
    const rect = el.getBoundingClientRect();
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  }

  class Button {
    constructor(el, value, onDown, onUp) {
      if (!el) {
        return;
      }

      this.el = el;
      this.value = value;
      this.callbacks = {
        onDown,
        onUp,
      };
      this.onTouchStart = this.onTouchStart.bind(this);
      this.onTouchEnd = this.onTouchEnd.bind(this);
      el.addEventListener("touchstart", this.onTouchStart, false);
      el.addEventListener("touchend", this.onTouchEnd, false);
      el.addEventListener("touchcancel", this.onTouchEnd, false);
    }
    onTouchStart(e) {
      e.preventDefault();
      this.callbacks.onDown(this.value);
    }
    onTouchEnd(e) {
      e.preventDefault();
      this.callbacks.onUp(this.value);
    }
  }

  class Stick {
    constructor(el, values, onDown, onUp) {
      if (!el) {
        return;
      }

      this.el = el;
      this.state = {
        value: undefined,
      };
      this.values = values;
      this.callbacks = {
        onDown,
        onUp,
      };
      this.onTouchStart = this.onTouchStart.bind(this);
      this.onTouchMove = this.onTouchMove.bind(this);
      this.onTouchEnd = this.onTouchEnd.bind(this);
      el.addEventListener("touchstart", this.onTouchStart, false);
      el.addEventListener("touchmove", this.onTouchMove, false);
      el.addEventListener("touchend", this.onTouchEnd, false);
      el.addEventListener("touchcancel", this.onTouchEnd, false);
    }
    getXPos(x) {
      const rect = this.el.getBoundingClientRect();
      if (x < rect.left) {
        return 0;
      }
      if (x > rect.left + rect.width) {
        return 1;
      }
      return (x - rect.left) / rect.width;
    }
    onTouchStart(e) {
      e.preventDefault();
      const touch = e.targetTouches[0];
      const value =
        this.getXPos(touch.clientX) < 0.5 ? this.values[0] : this.values[1];
      this.callbacks.onDown(value);
      this.state.value = value;
    }
    onTouchMove(e) {
      e.preventDefault();
      const touch = e.targetTouches[0];
      const coord = {
        x: touch.clientX,
        y: touch.clientY,
      };
      const value =
        this.getXPos(coord.x) < 0.5 ? this.values[0] : this.values[1];
      if (isInBounds(this.el, coord) === false) {
        // Touch is out of stick bounds
        this.callbacks.onUp(this.state.value);
        this.state.value = undefined;
      } else if (this.state.value !== value) {
        // Value has changed
        this.callbacks.onUp(this.state.value);
        this.callbacks.onDown(value);
        this.state.value = value;
      }
    }
    onTouchEnd(e) {
      e.preventDefault();
      this.callbacks.onUp(this.state.value);
      this.state.value = undefined;
    }
  }

  function init() {
    const keyup = (code) => {
      window.dispatchEvent(
        new KeyboardEvent("keyup", {
          keyCode: code,
          which: code,
        })
      );
    };

    const keydown = (code) => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          keyCode: code,
          which: code,
        })
      );
    };

    if ("ontouchstart" in window) {
      // Add touch listeners
      // Jump
      const jump = new Button(
        document.querySelector("#touch-jump"),
        32,
        keydown,
        keyup
      );
      // Stick
      const stick = new Stick(
        document.querySelector("#touch-stick"),
        [37, 39],
        keydown,
        keyup
      );
      // Restart
      const restart = new Button(
        document.querySelector("#touch-restart"),
        83,
        keydown,
        keyup
      );
      // Update element visibility
      document.querySelector(".touch-bar").style.display = "block";
      document.querySelector(".keymap").style.display = "none";
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
