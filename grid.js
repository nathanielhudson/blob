var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

class Stage {
  constructor(w=6, h=12) {
    this.scale = 20;

    this.gravity = 1.5;
    this.points = 0;

    this.grid = [];
    this.gridWidth = w;
    this.gridHeight = h;
    for (var x = 0; x < w; x++) {
      var col = [];
      for (var y = 0; y < h; y++) {
        col.push(null);
      }
      this.grid.push(col);
    }
  }
  update() {

  }
  fail() {
    console.error("you lose!");
  }
  render() {
    ctx.strokeRect(0,0,this.gridWidth*this.scale,this.gridHeight*this.scale);
    for (var x = 0; x < this.grid.length; x++) {
      for (var y = 0; y < this.grid[x].length; y++) {
        if (this.grid[x][y]) {
          this.grid[x][y].render();
        }
      }
    }
  }
  spawnFallingCell(x, color) {
    var blob = new Blob(x, this.gridHeight, color, this);
    blob.instantDrop();
  }
  linkCells() {
    for (var x = 0; x < this.grid.length; x++) {
      for (var y = 0; y < this.grid[x].length; y++) {
        var cell = this.grid[x][y];
        if (cell && cell.color != "grey") {
          cell.linked = 1;
          cell.linksCounted = false;
          cell.links.up = (this.grid[x][y+1] != null && this.grid[x][y+1].color == cell.color);
          cell.links.down = (this.grid[x][y-1] != null && this.grid[x][y-1].color == cell.color);
          cell.links.left = (this.grid[x-1] && this.grid[x-1][y] != null && this.grid[x-1][y].color == cell.color);
          cell.links.right = (this.grid[x+1] && this.grid[x+1][y] != null && this.grid[x+1][y].color == cell.color);
        }//if
      }//for
    }//for
  }
}

class Blob {
  constructor(x, y, color, stage) {
    this.stage = stage;
    this.pos = {x: x, y: y};
    this.color = color;
    this.linked = 1;
    this.linksCounted = false;
    this.links = {
      up: false,
      down: false,
      left: false,
      right: false
    };
  }
  countLinks(sum) {
    if (this.linksCounted) {
      return 0;
    }
    this.linksCounted = true;
    
    if (this.links.up) {
      this.stage.grid[this.pos.x][this.pos.y+1].countLinks(sum);
    }
    if (this.links.down) {
      this.stage.grid[this.pos.x][this.pos.y-1].countLinks(sum);
    }
    if (this.links.left) {
      this.stage.grid[this.pos.x-1][this.pos.y].countLinks(sum);
    }
    if (this.links.right) {
      this.stage.grid[this.pos.x+1][this.pos.y].countLinks(sum);
    }
    this.linked = sum;
    return sum;
  }
  snap() {
    this.pos.x = Math.floor(this.pos.x);
    this.pos.y = Math.floor(this.pos.y);
  }
  freeze() {
    this.snap();
    while(this.pos.y < this.stage.gridHeight) {
      if (this.stage.grid[this.pos.x][this.pos.y] === null) {
        this.stage.grid[this.pos.x][this.pos.y] = this;
        return;
      } else {
        console.log("move up")
        this.pos.y++; //cell is occupied, move up and try again.
      }
    }
    //COULDN'T freeze
    this.stage.fail()
  }
  instantDrop() { //mostly a test fcn?
    this.snap();
    for (; this.pos.y >= 0; this.pos.y--) {
      if (this.stage.grid[this.pos.x][this.pos.y-1] !== null) {
        //if there's a cell below us
        this.freeze();
        return;
      }
    }
    console.error("drop failed!");
    console.error(this);
  }
  update() {

  }
  render() {
    ctx.beginPath();
    ctx.arc(
      this.pos.x*this.stage.scale+this.stage.scale/2,
      this.stage.gridHeight*this.stage.scale-(this.pos.y*this.stage.scale+this.stage.scale/2),
      this.stage.scale/2*0.9,0,2*Math.PI
    );
    ctx.fillStyle = this.color;
    ctx.fill();
    if (this.links.down) {
      ctx.fillRect(
        (this.pos.x+0.15)*this.stage.scale,
        this.stage.gridHeight*this.stage.scale-((this.pos.y+0.5)*this.stage.scale),
        0.7*this.stage.scale,
        0.5*this.stage.scale
      );
    }//if down
    if (this.links.up) {
      ctx.fillRect(
        (this.pos.x+0.15)*this.stage.scale,
        this.stage.gridHeight*this.stage.scale-((this.pos.y+1)*this.stage.scale),
        0.7*this.stage.scale,
        0.5*this.stage.scale
      );
    }//if up
    if (this.links.left) {
      ctx.fillRect(
        this.pos.x*this.stage.scale,
        this.stage.gridHeight*this.stage.scale-(this.pos.y-0.15+1)*this.stage.scale,
        0.5*this.stage.scale,
        0.7*this.stage.scale
      );
    }//if left
    if (this.links.right) {
      ctx.fillRect(
        (this.pos.x+0.5)*this.stage.scale,
        this.stage.gridHeight*this.stage.scale-(this.pos.y-0.15+1)*this.stage.scale,
        0.5*this.stage.scale,
        0.7*this.stage.scale
      );
    }//if right
  }

}

var stage = new Stage();
for (var i = 0; i < 5; i++) {
  stage.spawnFallingCell(Math.random()*6, "red");
}
for (var i = 0; i < 5; i++) {
  stage.spawnFallingCell(Math.random()*6, "red");
}
for (var i = 0; i < 5; i++) {
  stage.spawnFallingCell(Math.random()*6, "green");
}
for (var i = 0; i < 5; i++) {
  stage.spawnFallingCell(Math.random()*6, "blue");
}
console.log(stage.grid[0][0].countLinks(0));
stage.linkCells();
stage.render();
console.log(stage);
