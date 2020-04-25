module Ladb::OpenCutList

  class TransformationUtils

    def self.get_scale3d(transformation)
      return Scale3d.new if transformation.nil?
      transformation_a = transformation.to_a
      vx = Geom::Vector3d.new(transformation_a[0], transformation_a[1], transformation_a[2])
      vy = Geom::Vector3d.new(transformation_a[4], transformation_a[5], transformation_a[6])
      vz = Geom::Vector3d.new(transformation_a[8], transformation_a[9], transformation_a[10])
      Scale3d.new(vx.length, vy.length, vz.length)
    end

    def self.get_flip3d(transformation)
      dot_x = transformation.xaxis % X_AXIS
      dot_y = transformation.yaxis % Y_AXIS
      dot_z = transformation.zaxis % Z_AXIS
      flipped = dot_x * dot_y * dot_z < 0
      Flip3d.new(flipped && dot_x < 0, flipped && dot_y < 0, flipped && dot_z < 0)
    end

    def self.multiply(transformation1, transformation2)
      if transformation1.nil?
        if transformation2.nil?
          nil
        else
          transformation2
        end
      else
        if transformation2.nil?
          transformation1
        else
          transformation1 * transformation2
        end
      end
    end

  end

end

