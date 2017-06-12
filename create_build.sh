for i in $(find . -type l | grep BUILD.bazel)
do
	cp $i ${i}.bk
	rm $i
	mv ${i}.bk $i
done
